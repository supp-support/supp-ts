import { HttpClient } from "../client";
import type { PriorityRule, PriorityRuleParams } from "../types";

function toRule(raw: Record<string, unknown>): PriorityRule {
  return {
    id: raw.id as string,
    priorityLevel: raw.priority_level as PriorityRule["priorityLevel"],
    actionType: raw.action_type as PriorityRule["actionType"],
    actionConfig: (raw.action_config as Record<string, unknown>) ?? {},
    enabled: raw.enabled as boolean,
  };
}

export class PriorityRules {
  constructor(private client: HttpClient) {}

  /**
   * List all priority rules (one per level: low, medium, high, critical).
   */
  async list(): Promise<PriorityRule[]> {
    const raw = await this.client.get<Array<Record<string, unknown>>>(
      "/api/priority-rules"
    );
    return raw.map(toRule);
  }

  /**
   * Create or update a priority rule.
   *
   * @example
   * ```ts
   * await supp.priorityRules.set({
   *   priorityLevel: "critical",
   *   actionType: "escalate",
   *   enabled: true
   * })
   * ```
   */
  async set(params: PriorityRuleParams): Promise<PriorityRule> {
    const raw = await this.client.post<Record<string, unknown>>(
      "/api/priority-rules",
      {
        priority_level: params.priorityLevel,
        action_type: params.actionType,
        action_config: params.actionConfig,
        enabled: params.enabled,
      }
    );
    return toRule(raw);
  }
}
