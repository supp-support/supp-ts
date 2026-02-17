import { HttpClient } from "../client";
import type {
  Conversation,
  ConversationDetail,
  ConversationListParams,
  ConversationReplyParams,
  ConversationStatus,
  Message,
} from "../types";

function toConversation(raw: Record<string, unknown>): Conversation {
  return {
    id: raw.id as string,
    subject: (raw.subject as string) ?? null,
    intent: (raw.intent as string) ?? null,
    status: raw.status as ConversationStatus,
    priority: raw.priority as Conversation["priority"],
    customerEmail: (raw.customer_email as string) ?? null,
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
  };
}

function toMessage(raw: Record<string, unknown>): Message {
  return {
    id: raw.id as string,
    senderType: raw.sender_type as Message["senderType"],
    body: raw.body as string,
    createdAt: raw.created_at as string,
  };
}

export class Conversations {
  constructor(private client: HttpClient) {}

  /**
   * List conversations with optional filters.
   *
   * @example
   * ```ts
   * const convos = await supp.conversations.list({ status: "escalated", limit: 10 })
   * ```
   */
  async list(params?: ConversationListParams): Promise<Conversation[]> {
    const raw = await this.client.get<Array<Record<string, unknown>>>(
      "/api/conversations",
      {
        status: params?.status,
        priority: params?.priority,
        page: params?.page,
        limit: params?.limit,
      }
    );
    return raw.map(toConversation);
  }

  /**
   * Get a single conversation with its full message history.
   */
  async get(id: string): Promise<ConversationDetail> {
    const raw = await this.client.get<Record<string, unknown>>(
      `/api/conversations/${encodeURIComponent(id)}`
    );

    return {
      ...toConversation(raw),
      messages: (
        (raw.messages as Array<Record<string, unknown>>) ?? []
      ).map(toMessage),
    };
  }

  /**
   * Update a conversation's status.
   *
   * @example
   * ```ts
   * await supp.conversations.update("conv_abc", { status: "resolved" })
   * ```
   */
  async update(
    id: string,
    params: { status: ConversationStatus }
  ): Promise<Conversation> {
    const raw = await this.client.patch<Record<string, unknown>>(
      `/api/conversations/${encodeURIComponent(id)}`,
      { status: params.status }
    );
    return toConversation(raw);
  }

  /**
   * List messages in a conversation.
   */
  async messages(conversationId: string): Promise<Message[]> {
    const raw = await this.client.get<Array<Record<string, unknown>>>(
      `/api/conversations/${encodeURIComponent(conversationId)}/messages`
    );
    return raw.map(toMessage);
  }

  /**
   * Reply to a conversation. Optionally resolve it at the same time.
   *
   * @example
   * ```ts
   * await supp.conversations.reply("conv_abc", {
   *   message: "Your issue has been resolved.",
   *   resolve: true
   * })
   * ```
   */
  async reply(
    conversationId: string,
    params: ConversationReplyParams
  ): Promise<Message> {
    const raw = await this.client.post<Record<string, unknown>>(
      `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
      { message: params.message, resolve: params.resolve }
    );
    return toMessage(raw);
  }
}
