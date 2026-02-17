import { HttpClient } from "../client";
import type { ApiKey, ApiKeyCreateParams, ApiKeyCreateResult } from "../types";

function toApiKey(raw: Record<string, unknown>): ApiKey {
  return {
    id: raw.id as string,
    label: raw.label as string,
    prefix: raw.prefix as string,
    type: raw.type as ApiKey["type"],
    createdAt: raw.created_at as string,
  };
}

export class ApiKeys {
  constructor(private client: HttpClient) {}

  /**
   * Create a new API key pair. Returns the raw keys — store them securely,
   * they cannot be retrieved again.
   *
   * @example
   * ```ts
   * const keys = await supp.apiKeys.create({ label: "Production" })
   * // { publishableKey: "pk_live_...", secretKey: "sk_live_..." }
   * ```
   */
  async create(params: ApiKeyCreateParams): Promise<ApiKeyCreateResult> {
    const raw = await this.client.post<Record<string, unknown>>(
      "/api/keys",
      { label: params.label }
    );

    return {
      publishableKey: raw.publishable_key as string,
      secretKey: raw.secret_key as string,
    };
  }

  /**
   * List all API keys for your organization. Keys are masked — only the prefix is shown.
   */
  async list(): Promise<ApiKey[]> {
    const raw = await this.client.get<Array<Record<string, unknown>>>(
      "/api/keys"
    );
    return raw.map(toApiKey);
  }

  /**
   * Permanently revoke an API key.
   */
  async revoke(keyId: string): Promise<void> {
    await this.client.delete(`/api/keys/${encodeURIComponent(keyId)}`);
  }
}
