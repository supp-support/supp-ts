import { HttpClient } from "../client";
import type { Balance, SpendCapParams, SpendCapResult } from "../types";

export class Billing {
  constructor(private client: HttpClient) {}

  /**
   * Check your current balance and recent charges.
   *
   * @example
   * ```ts
   * const info = await supp.billing.balance()
   * // { balance: 47.50, currency: "USD", recentCharges: [...] }
   * ```
   *
   * @free
   */
  async balance(): Promise<Balance> {
    const raw = await this.client.get<Record<string, unknown>>(
      "/api/balance"
    );

    return {
      balance: (raw.amount ?? raw.balance) as number,
      currency: (raw.currency as string) ?? "USD",
      recentCharges: (
        (raw.transactions ?? raw.recent_charges) as Array<Record<string, unknown>> ?? []
      ).map((c) => ({
        amount: c.amount as number,
        description: c.description as string,
        createdAt: c.created_at as string,
      })),
    };
  }

  /**
   * View, update, or temporarily override a spend cap for an API key.
   *
   * @example
   * ```ts
   * // View current cap
   * await supp.billing.spendCap({ action: "view", keyId: "key_abc" })
   *
   * // Update to $10/day
   * await supp.billing.spendCap({ action: "update", keyId: "key_abc", spendCap: 10.00 })
   *
   * // Approve overage for 48 hours
   * await supp.billing.spendCap({ action: "approve_overage", keyId: "key_abc", durationHours: 48 })
   * ```
   *
   * @free
   */
  async spendCap(params: SpendCapParams): Promise<SpendCapResult> {
    const body: Record<string, unknown> = {
      key_id: params.keyId,
    };

    if (params.action === "update") {
      body.spend_cap = params.spendCap;
      body.spend_window = params.spendWindow;
    } else if (params.action === "approve_overage") {
      body.approve_overage = true;
      body.duration_hours = params.durationHours;
    }

    const raw = await this.client.patch<Record<string, unknown>>(
      "/api/keys",
      body
    );

    return {
      cap: (raw.spend_cap ?? raw.cap) as number,
      used: (raw.current_spend ?? raw.used) as number,
      remaining: raw.remaining != null
        ? (raw.remaining as number)
        : (raw.spend_cap as number) - (raw.current_spend as number),
      window: (raw.spend_window ?? raw.window) as string,
    };
  }
}
