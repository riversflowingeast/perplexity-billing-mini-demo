const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const { scenarios } = require("./scenarios");
const { buildSystemPrompt } = require("./prompt");

const conversations = {};
const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

//
// LOAD REFERENCE DOCS
//
const DOCS_DIR = path.join(process.cwd(), "reference");

const DOC_LINKS = {
  canceling_a_subscription: "https://www.perplexity.ai/help-center/en/articles/10354283-canceling-a-subscription",
  choose_subscription_plan: "https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you",
  enterprise_pricing_and_billing_faq: "https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions",
  manage_enterprise_billing: "https://www.perplexity.ai/help-center/en/articles/11187557-how-to-manage-enterprise-billing",
  credits_enterprise_admin: "https://www.perplexity.ai/help-center/en/articles/13901296-how-credits-work-for-enterprise-organizations-admin-guide",
  credits_enterprise_member: "https://www.perplexity.ai/help-center/en/articles/13901321-how-credits-work-for-enterprise-organizations-member-guide",
  how_credits_work: "https://www.perplexity.ai/help-center/en/articles/13838041-how-credits-work-on-perplexity",
  external__computer_saving_techniques: null
};

const docs = fs.readdirSync(DOCS_DIR)
  .filter(file => file.endsWith(".txt"))
  .map(file => {
    const id = file.replace(".txt", "");
    return {
      id,
      content: fs.readFileSync(path.join(DOCS_DIR, file), "utf-8"),
      url: DOC_LINKS[id] || null
    };
  });

//
// SCENARIO-BASED ROUTING
//
function routeDocs(query, scenario) {
  const q = query.toLowerCase();

  switch (scenario.type) {

    case "computer_usage":
      return ["how_credits_work", "external__computer_saving_techniques"];

    case "enterprise_prospect":
      return [
        "choose_subscription_plan",
        "enterprise_pricing_and_billing_faq"
      ];

    case "enterprise_admin":
      return [
        "credits_enterprise_admin",
        "credits_enterprise_member",
        "manage_enterprise_billing",
        "enterprise_pricing_and_billing_faq",
        "choose_subscription_plan"
      ];

    default:
      return [
        "how_credits_work",
        "canceling_a_subscription",
        "choose_subscription_plan"
      ];
  }
}

//
// EXTRACT LINKS FROM RESPONSE
//
function extractLinks(text) {
  if (!text) return [];
  const regex = /https?:\/\/[^\s)]+/g;
  return text.match(regex) || [];
}

//
// NEW: SAFE LLM RESPONSE PARSER
//
function extractJSONFromText(text) {
  if (!text || typeof text !== "string") return null;

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) return null;

  return text.slice(start, end + 1);
}

function safeParseLLMResponse(raw) {
  if (!raw || typeof raw !== "string") {
    return {
      reply: "",
      shouldEscalate: false,
      reason: "Empty response",
      featureRequestLogged: false,
      signals: {}
    };
  }

  const jsonString = extractJSONFromText(raw);

  if (jsonString) {
    try {
      const parsed = JSON.parse(jsonString);

      return {
        reply: parsed.reply || raw.replace(jsonString, "").trim(),
        shouldEscalate: parsed.shouldEscalate || false,
        reason: parsed.reason || "",
        featureRequestLogged: parsed.featureRequestLogged || false,
        signals: parsed.signals || {}
      };
    } catch (e) {
      console.error("⚠️ Failed to parse embedded JSON:", jsonString);
    }
  }

  return {
    reply: raw.trim(),
    shouldEscalate: false,
    reason: "Fallback (no valid JSON detected)",
    featureRequestLogged: false,
    signals: {}
  };
}

app.post("/chat", async (req, res) => {
  const { message, scenarioId, sessionId } = req.body;

  const scenario = scenarios.find(s => s.id === scenarioId);

  if (!scenario) {
    return res.status(400).json({ error: "Invalid scenario" });
  }

  if (!conversations[sessionId]) {
    conversations[sessionId] = {
      messages: [],
      ended: false,
      estimatedSeats: null,
      region: null,
      usedLinks: new Set()
    };
  }

  const convo = conversations[sessionId];

  if (convo.ended) {
    return res.json({
      reply: "(demo ended)",
      escalate: true,
      reason: "Conversation already closed"
    });
  }

  convo.messages.push({
    role: "user",
    content: message
  });

  try {

    const docIds = routeDocs(message, scenario);
    const relevantDocs = docs.filter(d => docIds.includes(d.id));

    console.log("🧭 Scenario:", scenario.type);
    console.log("📚 Routed docs:", docIds);

    const usedLinksArray = Array.from(convo.usedLinks || []);

    const contextBlock = relevantDocs.map(doc => `
[DOCUMENT: ${doc.id}]
URL: ${doc.url || "N/A"}

${doc.content.slice(0, 4000)}
`).join("\n\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt({
            scenario,
            contextBlock: `
${contextBlock}

---

CONVERSATION STATE:
Links already used in this conversation:
${usedLinksArray.length ? usedLinksArray.join("\n") : "none"}
`
          })
        },
        ...convo.messages
      ]
    });

    let aiRaw = completion.choices[0].message.content;

    console.log("RAW AI OUTPUT:", aiRaw);

    const parsed = safeParseLLMResponse(aiRaw);

    if (parsed.signals) {
      if (parsed.signals.estimatedSeats != null) {
        convo.estimatedSeats = parsed.signals.estimatedSeats;
      }
      if (parsed.signals.region) {
        convo.region = parsed.signals.region;
      }
    }

    const links = extractLinks(parsed.reply);

    links.forEach(link => {
      convo.usedLinks.add(link);
    });

    if (parsed.shouldEscalate === true) {
      convo.ended = true;

      return res.json({
        reply: `${parsed.reply}

(you are being connected to a support specialist...)
(demo ended)`,
        escalate: true,
        reason: parsed.reason
      });
    }

    convo.messages.push({
      role: "assistant",
      content: parsed.reply
    });

    return res.json({
      reply: parsed.reply,
      escalate: false,
      reason: parsed.reason,
      featureRequestLogged: parsed.featureRequestLogged || false
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send("Error");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});