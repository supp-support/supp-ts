import {
  SuppError,
  AuthenticationError,
  InsufficientBalanceError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "./errors";

const DEFAULT_BASE_URL = "https://api.supp.support";
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number | boolean | undefined>;
}

export class HttpClient {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private timeout: number;

  constructor(
    apiKey: string,
    options: { baseUrl?: string; maxRetries?: number; timeout?: number } = {}
  ) {
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query);
    const headers: Record<string, string> = {
      "X-API-Key": this.apiKey,
      "Content-Type": "application/json",
    };

    const init: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body && options.method !== "GET") {
      init.body = JSON.stringify(options.body);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        init.signal = controller.signal;

        const response = await fetch(url, init);
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          return (json.data ?? json) as T;
        }

        const errorBody = await response.json().catch(() => ({}));
        const message =
          (errorBody as Record<string, unknown>).error as string ??
          `Request failed with status ${response.status}`;

        // Don't retry client errors (4xx)
        if (response.status < 500) {
          throw this.buildError(response.status, message);
        }

        lastError = new SuppError(message, response.status);
      } catch (error: unknown) {
        if (error instanceof SuppError) {
          throw error;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          lastError = new SuppError("Request timed out", 408, "TIMEOUT");
        } else {
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }

      // Exponential backoff before retry
      if (attempt < this.maxRetries) {
        await this.sleep(Math.min(1000 * 2 ** attempt, 8000));
      }
    }

    throw lastError ?? new SuppError("Request failed after retries", 500);
  }

  get<T>(path: string, query?: RequestOptions["query"]): Promise<T> {
    return this.request<T>({ method: "GET", path, query });
  }

  post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: "POST", path, body });
  }

  patch<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: "PATCH", path, body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>({ method: "DELETE", path });
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private buildError(status: number, message: string): SuppError {
    switch (status) {
      case 400:
        return new ValidationError(message);
      case 401:
        return new AuthenticationError(message);
      case 402:
        return new InsufficientBalanceError(message);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message);
      case 429:
        return new RateLimitError(message);
      default:
        return new SuppError(message, status);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
