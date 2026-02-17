// ── Client options ──────────────────────────────────────────────

export interface SuppOptions {
  /** Base URL for the API. Defaults to https://api.supp.support */
  baseUrl?: string;
  /** Maximum number of automatic retries on 5xx or network errors. Defaults to 2 */
  maxRetries?: number;
  /** Request timeout in milliseconds. Defaults to 30000 */
  timeout?: number;
}

// ── Classification ─────────────────────────────────────────────

export type Priority = "low" | "medium" | "high" | "critical";

export interface ClassifyParams {
  /** The customer message to classify */
  message: string;
  /** Include priority scoring (+$0.03). Defaults to false */
  includePriority?: boolean;
  /** Use batch pricing (50% discount). Defaults to false */
  isBatch?: boolean;
}

export interface ClassifyResult {
  intent: string;
  confidence: number;
  allIntents: Array<{ intent: string; confidence: number }>;
  priority?: Priority;
  actionType: string;
  suggestedResponse: string | null;
  cost: number;
}

export interface PriorityResult {
  priority: Priority;
  cost: number;
}

// ── Intents & Categories ───────────────────────────────────────

export interface Intent {
  intent: string;
  displayLabel: string;
  category: string;
}

export interface IntentListParams {
  category?: string;
}

export interface IntentListResult {
  intents: Intent[];
  total: number;
}

export interface Category {
  category: string;
  displayLabel: string;
  intentCount: number;
}

// ── Routing ────────────────────────────────────────────────────

export type ActionType = "mcp_action" | "template" | "escalate" | "none";

export interface RoutingRule {
  id: string;
  intent: string;
  actionType: ActionType;
  actionConfig: Record<string, unknown>;
  confidenceThreshold: number;
  priorityFilter?: Priority[];
  requireConfirmation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutingCreateParams {
  intent: string;
  actionType: ActionType;
  actionConfig?: Record<string, unknown>;
  confidenceThreshold?: number;
  priorityFilter?: Priority[];
  requireConfirmation?: boolean;
}

export interface RoutingUpdateParams {
  actionType?: ActionType;
  actionConfig?: Record<string, unknown>;
  confidenceThreshold?: number;
  priorityFilter?: Priority[];
  requireConfirmation?: boolean;
}

export interface RoutingBulkParams {
  intents: string[];
  actionType: ActionType;
  actionConfig?: Record<string, unknown>;
}

export interface RoutingSimulateResult {
  wouldFire: boolean;
  intent: string;
  confidence: number;
  matchedRule?: string;
}

// ── Conversations ──────────────────────────────────────────────

export type ConversationStatus = "open" | "pending" | "resolved" | "escalated";

export interface Conversation {
  id: string;
  subject: string | null;
  intent: string | null;
  status: ConversationStatus;
  priority: Priority | null;
  customerEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListParams {
  status?: ConversationStatus;
  priority?: Priority;
  page?: number;
  limit?: number;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface Message {
  id: string;
  senderType: "customer" | "ai" | "agent";
  body: string;
  createdAt: string;
}

export interface ConversationReplyParams {
  message: string;
  resolve?: boolean;
}

// ── Integrations ───────────────────────────────────────────────

export type IntegrationProvider =
  | "github"
  | "linear"
  | "jira"
  | "notion"
  | "slack"
  | "discord"
  | "teams"
  | "email"
  | "zendesk"
  | "intercom"
  | "hubspot"
  | "shopify"
  | "zapier"
  | "custom";

export interface Integration {
  id: string;
  provider: IntegrationProvider;
  name: string;
  connected: boolean;
  createdAt: string;
}

export interface IntegrationConnectParams {
  service: IntegrationProvider;
}

export interface IntegrationConnectResult {
  authUrl?: string;
  oauth: boolean;
  instructions?: string;
}

// ── Analytics ──────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalConversations: number;
  resolved: number;
  escalated: number;
  avgConfidence: number;
  totalCost: number;
  intentDistribution: Array<{
    intent: string;
    count: number;
    percentage: number;
  }>;
}

export interface AnalyticsParams {
  period?: string;
}

export interface AnalyticsExportParams {
  period?: string;
  format?: "csv" | "json";
}

export interface AnalyticsExportResult {
  downloadUrl: string;
  expiresAt: string;
}

export interface TriggerStats {
  triggerId: string;
  fired: number;
  autoResolved: number;
  rejected: number;
}

// ── Billing ────────────────────────────────────────────────────

export interface Balance {
  balance: number;
  currency: string;
  recentCharges: Array<{
    amount: number;
    description: string;
    createdAt: string;
  }>;
}

export type SpendCapAction = "view" | "update" | "approve_overage";

export interface SpendCapParams {
  action: SpendCapAction;
  keyId: string;
  spendCap?: number;
  spendWindow?: "daily" | "monthly";
  durationHours?: number;
}

export interface SpendCapResult {
  cap: number;
  used: number;
  remaining: number;
  window: string;
}

// ── API Keys ───────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  label: string;
  prefix: string;
  type: "publishable" | "secret";
  createdAt: string;
}

export interface ApiKeyCreateParams {
  label: string;
}

export interface ApiKeyCreateResult {
  publishableKey: string;
  secretKey: string;
}

// ── Priority Rules ─────────────────────────────────────────────

export interface PriorityRule {
  id: string;
  priorityLevel: Priority;
  actionType: ActionType;
  actionConfig: Record<string, unknown>;
  enabled: boolean;
}

export interface PriorityRuleParams {
  priorityLevel: Priority;
  actionType: ActionType;
  actionConfig?: Record<string, unknown>;
  enabled?: boolean;
}

// ── Approvals ──────────────────────────────────────────────────

export interface Approval {
  id: string;
  ticketId: string;
  intent: string;
  actionPreview: string;
  createdAt: string;
}
