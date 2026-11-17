export type ErrorFieldMap = Record<string, string[]>;

export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly fieldErrors?: ErrorFieldMap;

  protected constructor(
    message: string,
    statusCode: number,
    code: string,
    fieldErrors?: ErrorFieldMap,
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed.", fieldErrors?: ErrorFieldMap) {
    super(message, 400, "VALIDATION_ERROR", fieldErrors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Requested resource was not found.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Operation conflicts with current resource state.", code = "CONFLICT") {
    super(message, 409, code);
  }
}

export class LinkExpiredError extends AppError {
  constructor(message = "This medical share link has expired or been revoked.") {
    super(message, 410, "LINK_EXPIRED_OR_REVOKED");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded. Please try again shortly.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

export class ExternalProviderError extends AppError {
  constructor(message = "An external service is temporarily unavailable.") {
    super(message, 502, "EXTERNAL_PROVIDER_ERROR");
  }
}
