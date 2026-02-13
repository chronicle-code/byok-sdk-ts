/**
 * Base error class for all BYOK SDK errors.
 */
export class ByokError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly type: string | undefined;
  readonly details: unknown;

  constructor(
    message: string,
    status: number,
    opts?: { code?: string; type?: string; details?: unknown }
  ) {
    super(message);
    this.name = "ByokError";
    this.status = status;
    this.code = opts?.code;
    this.type = opts?.type;
    this.details = opts?.details;
  }
}

/** 401 — Invalid or missing API key / user credentials */
export class AuthenticationError extends ByokError {
  constructor(message: string, opts?: { code?: string; type?: string }) {
    super(message, 401, opts);
    this.name = "AuthenticationError";
  }
}

/** 402 — No wallet, insufficient balance, or wallet frozen */
export class PaymentRequiredError extends ByokError {
  constructor(message: string, opts?: { code?: string; type?: string }) {
    super(message, 402, opts);
    this.name = "PaymentRequiredError";
  }
}

/** 403 — Game not active, tier unavailable, consent not granted */
export class ForbiddenError extends ByokError {
  constructor(message: string, opts?: { code?: string; type?: string }) {
    super(message, 403, opts);
    this.name = "ForbiddenError";
  }
}

/** 404 — Resource not found */
export class NotFoundError extends ByokError {
  constructor(message: string, opts?: { code?: string; type?: string }) {
    super(message, 404, opts);
    this.name = "NotFoundError";
  }
}

/** 422 — Validation failed */
export class ValidationError extends ByokError {
  constructor(
    message: string,
    opts?: { code?: string; type?: string; details?: unknown }
  ) {
    super(message, 422, opts);
    this.name = "ValidationError";
  }
}

/** 429 — Rate limited or quota exceeded */
export class RateLimitError extends ByokError {
  /** Seconds to wait before retrying (from Retry-After header) */
  readonly retryAfter: number | undefined;

  constructor(
    message: string,
    opts?: { code?: string; type?: string; retryAfter?: number }
  ) {
    super(message, 429, opts);
    this.name = "RateLimitError";
    this.retryAfter = opts?.retryAfter;
  }
}

/** 502 — Upstream AI provider error */
export class ProviderError extends ByokError {
  constructor(message: string, opts?: { code?: string; type?: string }) {
    super(message, 502, opts);
    this.name = "ProviderError";
  }
}

/**
 * Parse an HTTP response into a typed error.
 */
export async function throwForStatus(response: Response): Promise<never> {
  let message = `BYOK API error (${response.status})`;
  let code: string | undefined;
  let type: string | undefined;
  let details: unknown;

  try {
    const body = await response.json();
    if (body?.error) {
      const err = typeof body.error === "string" ? { message: body.error } : body.error;
      message = err.message ?? message;
      code = err.code;
      type = err.type;
      details = err.details;
    }
  } catch {
    // body wasn't JSON; use status text
    message = response.statusText || message;
  }

  const retryAfter = response.headers.get("retry-after");

  switch (response.status) {
    case 401:
      throw new AuthenticationError(message, { code, type });
    case 402:
      throw new PaymentRequiredError(message, { code, type });
    case 403:
      throw new ForbiddenError(message, { code, type });
    case 404:
      throw new NotFoundError(message, { code, type });
    case 422:
      throw new ValidationError(message, { code, type, details });
    case 429:
      throw new RateLimitError(message, {
        code,
        type,
        retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
      });
    case 502:
      throw new ProviderError(message, { code, type });
    default:
      throw new ByokError(message, response.status, { code, type, details });
  }
}
