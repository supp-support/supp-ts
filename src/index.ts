import { HttpClient } from "./client";
import { Classify, Intents, Categories } from "./resources/classify";
import { Routing } from "./resources/routing";
import { Conversations } from "./resources/conversations";
import { Integrations } from "./resources/integrations";
import { Analytics } from "./resources/analytics";
import { Billing } from "./resources/billing";
import { ApiKeys } from "./resources/apikeys";
import { PriorityRules } from "./resources/priority";
import { Approvals } from "./resources/approvals";
import type { SuppOptions, ClassifyParams, ClassifyResult, PriorityResult } from "./types";

export class Supp {
  private _client: HttpClient;
  private _classify: Classify;

  /** Routing rules — map intents to actions */
  readonly routing: Routing;
  /** Conversations and tickets */
  readonly conversations: Conversations;
  /** Connected integrations (GitHub, Slack, Linear, etc.) */
  readonly integrations: Integrations;
  /** Analytics and usage stats */
  readonly analytics: Analytics;
  /** Balance and spend caps */
  readonly billing: Billing;
  /** API key management */
  readonly apiKeys: ApiKeys;
  /** Priority-level rules (auto-escalate critical, etc.) */
  readonly priorityRules: PriorityRules;
  /** Approval queue for actions requiring confirmation */
  readonly approvals: Approvals;
  /** Browse available intents */
  readonly intents: Intents;
  /** Browse intent categories */
  readonly categories: Categories;

  /**
   * Create a new Supp client.
   *
   * @param apiKey - Your secret API key (`sk_live_...`)
   * @param options - Optional configuration
   *
   * @example
   * ```ts
   * import { Supp } from "supp-ts";
   *
   * const supp = new Supp("sk_live_abc123");
   * ```
   */
  constructor(apiKey: string, options: SuppOptions = {}) {
    if (!apiKey) {
      throw new Error(
        "API key is required. Get one at https://supp.support/dashboard"
      );
    }

    this._client = new HttpClient(apiKey, {
      baseUrl: options.baseUrl,
      maxRetries: options.maxRetries,
      timeout: options.timeout,
    });

    this._classify = new Classify(this._client);
    this.routing = new Routing(this._client);
    this.conversations = new Conversations(this._client);
    this.integrations = new Integrations(this._client);
    this.analytics = new Analytics(this._client);
    this.billing = new Billing(this._client);
    this.apiKeys = new ApiKeys(this._client);
    this.priorityRules = new PriorityRules(this._client);
    this.approvals = new Approvals(this._client);
    this.intents = new Intents(this._client);
    this.categories = new Categories(this._client);
  }

  /**
   * Classify a customer message into one of 315 intents.
   *
   * @param message - The message text, or a params object for advanced options
   * @returns Classification result with intent, confidence, and cost
   *
   * @example
   * ```ts
   * const result = await supp.classify("I need a refund");
   * console.log(result.intent);     // "refund_initiation"
   * console.log(result.confidence); // 0.94
   * ```
   *
   * @cost $0.20 per classification
   */
  classify(message: string | ClassifyParams): Promise<ClassifyResult> {
    return this._classify.run(message);
  }

  /**
   * Classify with priority scoring included.
   *
   * @cost $0.23 per classification
   */
  classifyWithPriority(message: string): Promise<ClassifyResult> {
    return this._classify.withPriority(message);
  }

  /**
   * Score a message's priority without classifying it.
   *
   * @cost $0.03 per score
   */
  priorityScore(message: string): Promise<PriorityResult> {
    return this._classify.priorityScore(message);
  }
}

// Named exports for types and errors
export type {
  SuppOptions,
  ClassifyParams,
  ClassifyResult,
  PriorityResult,
  Priority,
  ActionType,
  ConversationStatus,
  IntegrationProvider,
  SpendCapAction,
  Intent,
  IntentListParams,
  IntentListResult,
  Category,
  RoutingRule,
  RoutingCreateParams,
  RoutingUpdateParams,
  RoutingBulkParams,
  RoutingSimulateResult,
  Conversation,
  ConversationDetail,
  ConversationListParams,
  ConversationReplyParams,
  Message,
  Integration,
  IntegrationConnectParams,
  IntegrationConnectResult,
  AnalyticsSummary,
  AnalyticsParams,
  AnalyticsExportParams,
  AnalyticsExportResult,
  TriggerStats,
  Balance,
  SpendCapParams,
  SpendCapResult,
  ApiKey,
  ApiKeyCreateParams,
  ApiKeyCreateResult,
  PriorityRule,
  PriorityRuleParams,
  Approval,
} from "./types";

export {
  SuppError,
  AuthenticationError,
  InsufficientBalanceError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "./errors";
