import { HttpClient } from "../client";
import type {
  RoutingRule,
  RoutingCreateParams,
  RoutingUpdateParams,
  RoutingBulkParams,
  RoutingSimulateResult,
} from "../types";

function toRule(raw: Record<string, unknown>): RoutingRule {
  return {
    id: raw.id as string,
    intent: raw.intent as string,
    actionType: raw.action_type as RoutingRule["actionType"],
    actionConfig: (raw.action_config as Record<string, unknown>) ?? {},
    confidenceThreshold: raw.confidence_threshold as number,
    priorityFilter: raw.priority_filter as RoutingRule["priorityFilter"],
    requireConfirmation: raw.require_confirmation as boolean,
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
  };
}

export class Routing {
  constructor(private client: HttpClient) {}

  /**
   * List all routing rules for your organization.
   */
  async list(): Promise<RoutingRule[]> {
    const raw = await this.client.get<Array<Record<string, unknown>>>(
      "/api/routing"
    );
    return raw.map(toRule);
  }

  /**
   * Get a single routing rule by ID.
   */
  async get(id: string): Promise<RoutingRule> {
    const raw = await this.client.get<Record<string, unknown>>(
      `/api/routing/${encodeURIComponent(id)}`
    );
    return toRule(raw);
  }

  /**
   * Create a new routing rule. If a rule already exists for the intent, it will be updated.
   *
   * @example
   * ```ts
   * await supp.routing.create({
   *   intent: "bug_report",
   *   actionType: "mcp_action",
   *   actionConfig: { integration_provider: "github", github_labels: ["bug"] }
   * })
   * ```
   */
  async create(params: RoutingCreateParams): Promise<RoutingRule> {
    const raw = await this.client.post<Record<string, unknown>>(
      "/api/routing",
      {
        intent: params.intent,
        action_type: params.actionType,
        action_config: params.actionConfig,
        confidence_threshold: params.confidenceThreshold,
        priority_filter: params.priorityFilter,
        require_confirmation: params.requireConfirmation,
      }
    );
    return toRule(raw);
  }

  /**
   * Update an existing routing rule.
   */
  async update(id: string, params: RoutingUpdateParams): Promise<RoutingRule> {
    const body: Record<string, unknown> = {};
    if (params.actionType !== undefined) body.action_type = params.actionType;
    if (params.actionConfig !== undefined)
      body.action_config = params.actionConfig;
    if (params.confidenceThreshold !== undefined)
      body.confidence_threshold = params.confidenceThreshold;
    if (params.priorityFilter !== undefined)
      body.priority_filter = params.priorityFilter;
    if (params.requireConfirmation !== undefined)
      body.require_confirmation = params.requireConfirmation;

    const raw = await this.client.patch<Record<string, unknown>>(
      `/api/routing/${encodeURIComponent(id)}`,
      body
    );
    return toRule(raw);
  }

  /**
   * Delete a routing rule.
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/routing/${encodeURIComponent(id)}`);
  }

  /**
   * Apply the same routing config to multiple intents at once (up to 500).
   */
  async bulkUpdate(params: RoutingBulkParams): Promise<{ updated: number }> {
    return this.client.post<{ updated: number }>("/api/routing/batch", {
      intents: params.intents,
      action_type: params.actionType,
      action_config: params.actionConfig,
    });
  }

  /**
   * Simulate whether a routing rule would fire for sample text. Non-destructive.
   */
  async simulate(
    ruleId: string,
    sampleText: string
  ): Promise<RoutingSimulateResult> {
    const raw = await this.client.post<Record<string, unknown>>(
      "/api/routing/test",
      { trigger_id: ruleId, sample_text: sampleText }
    );

    return {
      wouldFire: raw.would_fire as boolean,
      intent: raw.intent as string,
      confidence: raw.confidence as number,
      matchedRule: raw.matched_rule as string | undefined,
    };
  }
}
