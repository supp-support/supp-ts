import { HttpClient } from "../client";
import type { Approval } from "../types";

function toApproval(raw: Record<string, unknown>): Approval {
  return {
    id: raw.id as string,
    ticketId: raw.ticket_id as string,
    intent: raw.intent as string,
    actionPreview: raw.action_preview as string,
    createdAt: raw.created_at as string,
  };
}

export class Approvals {
  constructor(private client: HttpClient) {}

  /**
   * List pending approvals (tickets that require manual confirmation before action executes).
   */
  async list(): Promise<Approval[]> {
    const raw = await this.client.get<Record<string, unknown>>(
      "/api/approvals"
    );
    const pending = (raw.pending as Array<Record<string, unknown>>) ?? [];
    return pending.map(toApproval);
  }

  /**
   * Approve a pending action.
   */
  async approve(approvalId: string): Promise<void> {
    await this.client.post(`/api/approvals/${encodeURIComponent(approvalId)}/approve`);
  }

  /**
   * Reject a pending action with an optional reason.
   */
  async reject(approvalId: string, reason?: string): Promise<void> {
    await this.client.post(`/api/approvals/${encodeURIComponent(approvalId)}/reject`, {
      reason: reason ?? "",
    });
  }
}
