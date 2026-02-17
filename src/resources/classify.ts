import { HttpClient } from "../client";
import type {
  ClassifyParams,
  ClassifyResult,
  PriorityResult,
  Intent,
  IntentListParams,
  IntentListResult,
  Category,
} from "../types";

export class Classify {
  constructor(private client: HttpClient) {}

  /**
   * Classify a customer message into one of 315 intents.
   *
   * @param message - The message to classify, or a full params object
   * @returns Classification result with intent, confidence, and optional priority
   *
   * @example
   * ```ts
   * const result = await supp.classify("I need a refund")
   * // { intent: "refund_initiation", confidence: 0.94, ... }
   * ```
   *
   * @cost $0.20 per classification, $0.23 with priority, 50% off in batch mode
   */
  async run(message: string | ClassifyParams): Promise<ClassifyResult> {
    const params = typeof message === "string" ? { message } : message;

    const raw = await this.client.post<Record<string, unknown>>(
      "/api/ai/classify",
      {
        message: params.message,
        include_priority: params.includePriority ?? false,
        is_batch: params.isBatch ?? false,
      }
    );

    return {
      intent: raw.intent as string,
      confidence: raw.confidence as number,
      allIntents: (raw.all_intents as Array<Record<string, unknown>> ?? []).map(
        (i) => ({
          intent: i.intent as string,
          confidence: i.confidence as number,
        })
      ),
      priority: raw.priority as ClassifyResult["priority"],
      actionType: raw.action_type as string,
      suggestedResponse: (raw.suggested_response as string) ?? null,
      cost: raw.cost as number,
    };
  }

  /**
   * Classify a message with priority scoring included.
   * Shorthand for `classify({ message, includePriority: true })`.
   *
   * @cost $0.23 per classification
   */
  async withPriority(message: string): Promise<ClassifyResult> {
    return this.run({ message, includePriority: true });
  }

  /**
   * Score a message's priority level without classifying it.
   *
   * @cost $0.03 per score
   */
  async priorityScore(message: string): Promise<PriorityResult> {
    const raw = await this.client.post<Record<string, unknown>>(
      "/api/ai/priority",
      { message }
    );

    return {
      priority: raw.priority as PriorityResult["priority"],
      cost: raw.cost as number,
    };
  }
}

export class Intents {
  constructor(private client: HttpClient) {}

  /**
   * List available intents, optionally filtered by category.
   *
   * @free
   */
  async list(params?: IntentListParams): Promise<IntentListResult> {
    const raw = await this.client.get<Record<string, unknown>>(
      "/api/ai/intents",
      { category: params?.category }
    );

    return {
      intents: (raw.intents as Array<Record<string, unknown>>).map((i) => ({
        intent: i.intent as string,
        displayLabel: i.display_label as string,
        category: i.category as string,
      })),
      total: raw.total as number,
    };
  }
}

export class Categories {
  constructor(private client: HttpClient) {}

  /**
   * List all 13 intent categories.
   *
   * @free
   */
  async list(): Promise<Category[]> {
    const raw = await this.client.get<Array<Record<string, unknown>>>(
      "/api/ai/categories"
    );

    return raw.map((c) => ({
      category: c.category as string,
      displayLabel: c.display_label as string,
      intentCount: c.intent_count as number,
    }));
  }
}
