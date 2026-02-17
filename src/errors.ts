export class SuppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "SuppError";
    this.status = status;
    this.code = code ?? `HTTP_${status}`;
  }
}

export class AuthenticationError extends SuppError {
  constructor(message = "Invalid or missing API key") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class InsufficientBalanceError extends SuppError {
  constructor(message = "Insufficient balance") {
    super(message, 402, "INSUFFICIENT_BALANCE");
    this.name = "InsufficientBalanceError";
  }
}

export class ForbiddenError extends SuppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends SuppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends SuppError {
  constructor(message = "Rate limit or spend cap exceeded") {
    super(message, 429, "RATE_LIMITED");
    this.name = "RateLimitError";
  }
}

export class ValidationError extends SuppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
