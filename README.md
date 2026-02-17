# supp-ts

Official TypeScript SDK for the [Supp](https://supp.support) API — AI-powered customer support classification and routing.

[![npm version](https://img.shields.io/npm/v/supp-ts.svg)](https://www.npmjs.com/package/supp-ts)
[![License: Supp SDK](https://img.shields.io/badge/License-Supp%20SDK-blue.svg)](LICENSE)

## Install

```bash
npm install supp-ts
```

## Quick Start

```ts
import { Supp } from "supp-ts";

const supp = new Supp("sk_live_...");

// Classify a customer message — $0.20
const result = await supp.classify("I need a refund for my last order");
console.log(result.intent);     // "refund_initiation"
console.log(result.confidence); // 0.94

// Classify + priority in one call — $0.23
const full = await supp.classifyWithPriority("Our entire team is locked out");
console.log(full.intent);   // "account_lockout"
console.log(full.priority); // "critical"
```

## Usage

### Classification

Classify messages into 315 intents across 13 categories. Three methods at different price points:

| Method | Returns | Cost |
|--------|---------|------|
| `classify()` | intent, confidence, suggested action | $0.20 |
| `classifyWithPriority()` | everything above + priority level | $0.23 |
| `priorityScore()` | priority level only | $0.03 |

```ts
// Basic — intent + confidence ($0.20)
const result = await supp.classify("The app crashes when I open settings");
console.log(result.intent);      // "bug_report"
console.log(result.confidence);  // 0.91
console.log(result.actionType);  // "mcp_action"

// Full — intent + confidence + priority ($0.23)
const full = await supp.classifyWithPriority("Our entire team is locked out");
console.log(full.intent);   // "account_lockout"
console.log(full.priority); // "critical"

// Priority only — just urgency scoring ($0.03)
const priority = await supp.priorityScore("When do you open?");
console.log(priority.priority); // "low"
```

### Routing Rules

Map intents to actions — create GitHub issues, post to Slack, send templates, or escalate to humans.

```ts
// Create a rule
await supp.routing.create({
  intent: "bug_report",
  actionType: "mcp_action",
  actionConfig: {
    integration_provider: "github",
    github_owner: "acme",
    github_repo: "app",
    github_labels: ["bug"],
  },
});

// List all rules
const rules = await supp.routing.list();

// Simulate without side effects
const sim = await supp.routing.simulate("rule_id", "App crashes on startup");
console.log(sim.wouldFire); // true

// Bulk update — route all billing intents to Slack
await supp.routing.bulkUpdate({
  intents: ["refund_request", "invoice_dispute", "payment_failed"],
  actionType: "mcp_action",
  actionConfig: { integration_provider: "slack", channel: "#billing" },
});
```

### Conversations

```ts
// List escalated tickets
const tickets = await supp.conversations.list({ status: "escalated" });

// Get full conversation with messages
const convo = await supp.conversations.get("conv_abc123");

// Reply and resolve
await supp.conversations.reply("conv_abc123", {
  message: "Your issue has been resolved. Let us know if you need anything else.",
  resolve: true,
});
```

### Integrations

```ts
// List connected services
const integrations = await supp.integrations.list();

// Connect a new service (returns OAuth URL)
const { authUrl } = await supp.integrations.connect({ service: "github" });
// → Open authUrl in browser to authorize
```

### Analytics

```ts
// Get summary stats
const stats = await supp.analytics.summary({ period: "30d" });
console.log(stats.totalConversations); // 1420
console.log(stats.resolved);          // 1180

// Export as CSV
const { downloadUrl } = await supp.analytics.export({ period: "month", format: "csv" });
```

### Billing

```ts
// Check balance
const { balance } = await supp.billing.balance();
console.log(balance); // 47.50

// View spend cap
const cap = await supp.billing.spendCap({ action: "view", keyId: "key_abc" });
console.log(cap.remaining); // 1.80
```

### Browse Intents

```ts
// List all 13 categories
const categories = await supp.categories.list();

// List intents in a category
const { intents } = await supp.intents.list({ category: "technical_support" });
// → 47 intents: bug_report, performance_issue, api_troubleshooting, ...
```

### API Keys

```ts
// Create a new key pair
const keys = await supp.apiKeys.create({ label: "Production" });
console.log(keys.publishableKey); // "pk_live_..."
console.log(keys.secretKey);      // "sk_live_..." — store securely

// List keys (masked)
const allKeys = await supp.apiKeys.list();

// Revoke a key
await supp.apiKeys.revoke("key_id");
```

### Priority Rules

```ts
// Auto-escalate critical messages
await supp.priorityRules.set({
  priorityLevel: "critical",
  actionType: "escalate",
  enabled: true,
});
```

### Approvals

```ts
// List pending approvals
const pending = await supp.approvals.list();

// Approve or reject
await supp.approvals.approve("approval_id");
await supp.approvals.reject("approval_id", "Already handled via email");
```

## Configuration

```ts
const supp = new Supp("sk_live_...", {
  baseUrl: "https://api.supp.support", // default
  maxRetries: 2,                        // automatic retries on 5xx
  timeout: 30000,                       // request timeout in ms
});
```

## Error Handling

The SDK throws typed errors you can catch and handle:

```ts
import {
  Supp,
  SuppError,
  AuthenticationError,
  InsufficientBalanceError,
  RateLimitError,
  ValidationError,
} from "supp-ts";

try {
  await supp.classify("...");
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    // Add credits at supp.support/dashboard
  } else if (error instanceof RateLimitError) {
    // Spend cap exceeded or too many requests
  } else if (error instanceof AuthenticationError) {
    // Invalid API key
  } else if (error instanceof ValidationError) {
    // Bad request params
  } else if (error instanceof SuppError) {
    console.log(error.status); // HTTP status code
    console.log(error.code);   // Error code string
  }
}
```

## CommonJS

```js
const { Supp } = require("supp-ts");

const supp = new Supp("sk_live_...");
const result = await supp.classify("I need help");
```

## Requirements

- Node.js 18+
- A Supp account and API key ([sign up](https://supp.support))

## Pricing

| Action | Cost |
|--------|------|
| `classify()` | $0.20 |
| `classifyWithPriority()` | $0.23 |
| `priorityScore()` | $0.03 |
| Batch classification | 50% discount |
| Everything else | Free |

New accounts get **$5.00 in free credits**.

## Links

- [Documentation](https://supp.support/docs)
- [Dashboard](https://supp.support/dashboard)
- [MCP Server Docs](https://github.com/supp-support/mcp-docs)

## License

Supp SDK License — free to use with the Supp platform. See [LICENSE](LICENSE).
