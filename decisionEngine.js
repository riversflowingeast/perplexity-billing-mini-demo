function detectFrustration(message) {
  const triggers = [
    "frustrated",
    "this is ridiculous",
    "not helping",
    "human",
    "agent",
    "representative"
  ];
  return triggers.some(t => message.toLowerCase().includes(t));
}

function decideEscalation(message, scenario) {
  let escalate = false;
  let reason = "AI can resolve";

  if (
    scenario.type === "refund" ||
    scenario.type === "billing_error" ||
    scenario.type === "account_issue" ||
    scenario.type === "tax" ||
    scenario.type === "enterprise_sales"
  ) {
    escalate = true;
    reason = "Billing or policy issue";
  }

  if (detectFrustration(message)) {
    escalate = true;
    reason = "User requested human or showed frustration";
  }

  if (scenario.type === "computer_usage") {
    if (scenario.firstTime || message.toLowerCase().includes("refund")) {
      escalate = true;
      reason = "Courtesy refund review";
    }
  }

  return { escalate, reason };
}

module.exports = { decideEscalation };