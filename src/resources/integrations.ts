import { HttpClient } from "../client";
import type {
  Integration,
  IntegrationConnectParams,
  IntegrationConnectResult,
} from "../types";

function toIntegration(raw: Record<string, unknown>): Integration {
  return {
    id: raw.id as string,
    provider: raw.provider as Integration["provider"],
    name: raw.name as string,
    connected: raw.connected as boolean,
    createdAt: raw.created_at as string,
  };
}

export class Integrations {
  constructor(private client: HttpClient) {}

  /**
   * List all connected and available integrations.
   */
  async list(): Promise<Integration[]> {
    const raw = await this.client.get<Array<Record<string, unknown>>>(
      "/api/integrations"
    );
    return raw.map(toIntegration);
  }

  /**
   * Start connecting a service. Returns an OAuth URL for OAuth providers,
   * or setup instructions for API-key-based providers.
   *
   * @example
   * ```ts
   * const result = await supp.integrations.connect({ service: "github" })
   * // result.authUrl → "https://github.com/login/oauth/authorize?..."
   * ```
   */
  async connect(
    params: IntegrationConnectParams
  ): Promise<IntegrationConnectResult> {
    const raw = await this.client.post<Record<string, unknown>>(
      "/api/integrations/connect",
      { service: params.service }
    );

    return {
      authUrl: raw.auth_url as string | undefined,
      oauth: raw.oauth as boolean,
      instructions: raw.instructions as string | undefined,
    };
  }

  /**
   * Disconnect an integration.
   */
  async disconnect(integrationId: string): Promise<void> {
    await this.client.delete(`/api/integrations?id=${encodeURIComponent(integrationId)}`);
  }

  /**
   * Verify that an integration's tokens are still valid.
   */
  async verify(integrationId: string): Promise<{ valid: boolean }> {
    return this.client.post<{ valid: boolean }>("/api/integrations/verify", {
      id: integrationId,
    });
  }
}
