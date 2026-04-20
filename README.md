# Perplexity Billing Support Chatbot (Minimal AI Prototype)

## Overview

This is a minimal prototype of a billing support chatbot for Perplexity scenarios.

It combines:

* A real AI model (OpenAI API) for natural conversation
* A deterministic decision engine for escalation logic
* A scenario simulation layer (no real account access)

The system is designed to demonstrate:

* When AI can resolve issues
* When escalation to human support is required

---

## Features

### Scenario Simulation

Users select from predefined billing situations:

* Individual plans (Pro, Max)
* Enterprise billing
* Edge cases (refunds, VAT, missing subscriptions)
* "Computer" usage credit drain

---

### AI Chatbot

Uses OpenAI to:

* Generate natural responses
* Explain billing concepts
* Provide usage guidance
* Handle tone and ambiguity

---

### Escalation Logic

Escalation is triggered when:

* Refunds are requested
* Billing inconsistencies are reported
* Account issues are present
* Tax or enterprise contract issues arise
* User expresses frustration or asks for a human

---

### Simulated Account Access

The bot never claims to access real data. Instead it says:
"I would normally check your account..."

---

### Special Case: Computer Usage

Includes:

* Practical tips to reduce credit usage
* Explanation of high consumption behavior
* Courtesy refund escalation for first-time misuse

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set API key

```bash
export OPENAI_API_KEY=your_key_here
```

### 3. Run server

```bash
node server.js
```

### 4. Open

http://localhost:3000

---

## Structure

/project
server.js
scenarios.js
decisionEngine.js
public/
index.html
app.js

---

## Notes

* No database
* No authentication
* No real billing integration
* Designed for demonstration only

---


Demo Overview

This project is a simulation of a Perplexity-style support chatbot designed to demonstrate how customer support requests should be handled across different resolution paths. The system focuses on distinguishing between issues that can be resolved directly by an AI assistant, cases that should be handled through documentation, and situations that require escalation to a human support or sales representative.

The intent of this demo is not to replicate backend systems or real account functionality, but to show decision-making logic in a support environment and how different types of customer intent should be routed appropriately.

Core Purpose

The chatbot is designed to model three primary outcomes in a support interaction.

First, it should resolve queries directly when the assistant is confident in providing a complete answer. These are typically general product questions or “how do I” style requests where no external intervention is required.

Second, it should handle certain questions by referencing documentation-style responses rather than escalating. This applies to billing explanations, subscription-related information, and known product limitations. In these cases, the system should remain self-serve and avoid unnecessary escalation.

Third, it should escalate to a human when appropriate. This includes situations where the user explicitly requests a human agent, expresses frustration or dissatisfaction, or where the request involves billing disputes, refund eligibility review, or sales and enterprise intervention.

Feature Request Handling

Some user requests may be valid but not currently supported by the system. In these cases, the chatbot should not escalate to support. Instead, it should acknowledge the request and log it as a feature request. This is intended to demonstrate how product feedback can be captured without unnecessarily involving support teams.

For example, if a user asks whether organizational billing controls can be managed in a shared way across all members, the assistant should explain that the feature is not currently available and indicate that a request has been logged.

Computer Usage Scenario (Credit Drain)

The demo includes a simulated scenario involving Perplexity Pro and the Computer feature, which is a high-compute tool that can consume credits quickly depending on usage complexity.

In first-time usage scenarios, users may incorrectly assume that rapid credit consumption is an error. The assistant should acknowledge this concern, explain that high usage is expected behavior for compute-intensive tasks, and may optionally offer a courtesy escalation for review in cases of confusion.

In repeat usage scenarios, the assistant should focus on education and usage guidance rather than offering refunds or escalation, as the behavior is assumed to be understood.

Enterprise Scenarios

The system includes two enterprise-related flows.

The first is an enterprise prospect scenario, where the chatbot acts as a lead qualification assistant. It gathers key details such as company size, estimated number of seats, and region of operation. Based on this information, routing decisions are made. For example, companies based in Japan are directed to a regional partner contact flow, while larger organizations with approximately 250 or more seats are escalated to enterprise support or sales teams. Smaller prospects continue through the qualification flow.

The second is an enterprise admin billing scenario, where users may ask questions about billing controls, usage limits, or account management capabilities. In these cases, the assistant should first attempt to explain available functionality or limitations. If a request is not supported, it should be treated as a feature request rather than an escalation. Escalation should only occur when human intervention is clearly required.

System Limitations

This is a frontend and AI-based simulation only. There is no integration with real backend systems, billing data, or user authentication. The chatbot does not have access to actual account information and instead relies on predefined scenarios to simulate context such as subscription type, user role, and product usage.

Because of this, certain responses may include simulated behavior such as “checking account details” or “reviewing usage,” which are intended to reflect what would happen in a fully integrated production system.

Scenario-Based Simulation

The demo uses a fixed set of scenarios to simulate different customer contexts. These include computer usage credit drain cases (first-time and repeat users), general Pro subscription questions, billing errors, enterprise contract inquiries, enterprise prospect qualification, and enterprise admin billing questions.

Each scenario provides structured context that influences how the assistant behaves, including whether escalation, documentation, or feature request logging is appropriate.

Escalation Behavior

Escalation occurs only when necessary. Frustration, explicit requests for a human representative, billing disputes, or sales-related intervention requirements will trigger escalation. In these cases, the conversation is terminated and the user is transitioned to a simulated support specialist handoff.

Other cases are intentionally handled without escalation to demonstrate containment within AI or self-serve resolution paths.

Design Principle

The system is designed to minimize unnecessary escalation while ensuring that users receive correct, contextual, and helpful responses. The assistant should prioritize resolution where possible, documentation where appropriate, and escalation only when it meaningfully improves the outcome.

Intended Use

This demo is intended for evaluating support workflows, escalation logic design, AI-assisted customer support behavior, and the boundary between automated resolution and human intervention.