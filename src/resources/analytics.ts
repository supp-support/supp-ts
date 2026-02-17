import { HttpClient } from "../client";
import type {
  AnalyticsSummary,
  AnalyticsParams,
  AnalyticsExportParams,
  AnalyticsExportResult,
  TriggerStats,
} from "../types";

export class Analytics {
  constructor(private client: HttpClient) {}

  /**
   * Get a summary of tickets, resolution rate, and costs for a given period.
   *
   * @example
   * ```ts
   * const stats = await supp.analytics.summary({ period: "30d" })
   * // { totalConversations: 1420, resolved: 1180, ... }
   * ```
   */
  async summary(params?: AnalyticsParams): Promise<AnalyticsSummary> {
    const raw = await this.client.get<Record<string, unknown>>(
      "/api/analytics",
      { period: params?.period }
    );

    const summary = (raw.summary ?? raw) as Record<string, unknown>;
    return {
      totalConversations: summary.total_conversations as number,
      resolved: summary.resolved as number,
      escalated: summary.escalated as number,
      avgConfidence: summary.avg_confidence as number,
      totalCost: summary.total_cost as number,
      intentDistribution: (
        (raw.intent_distribution as Array<Record<string, unknown>>) ?? []
      ).map((i) => ({
        intent: i.intent as string,
        count: i.count as number,
        percentage: i.percentage as number,
      })),
    };
  }

  /**
   * Get performance stats for a specific trigger.
   */
  async triggers(params: {
    triggerId: string;
    period?: string;
  }): Promise<TriggerStats> {
    const raw = await this.client.get<Record<string, unknown>>(
      "/api/analytics/triggers",
      { trigger_id: params.triggerId, period: params.period }
    );

    return {
      triggerId: raw.trigger_id as string,
      fired: raw.fired as number,
      autoResolved: raw.auto_resolved as number,
      rejected: raw.rejected as number,
    };
  }

  /**
   * Export analytics data as CSV or JSON. Returns a download URL that expires in 24 hours.
   */
  async export(params?: AnalyticsExportParams): Promise<AnalyticsExportResult> {
    const raw = await this.client.post<Record<string, unknown>>(
      "/api/analytics/export",
      { period: params?.period, format: params?.format ?? "csv" }
    );

    return {
      downloadUrl: raw.download_url as string,
      expiresAt: raw.expires_at as string,
    };
  }
}
