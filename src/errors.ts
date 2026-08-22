export class HttpError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(status: number, message: string, details?: any, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found", details?: any, code = "NOT_FOUND") {
    super(404, message, details, code);
  }
}

export class ValidationError extends HttpError {
  constructor(message = "Invalid request", details?: any, code = "VALIDATION_ERROR") {
    super(400, message, details, code);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized", details?: any, code = "UNAUTHORIZED") {
    super(401, message, details, code);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden", details?: any, code = "FORBIDDEN") {
    super(403, message, details, code);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict", details?: any, code = "CONFLICT") {
    super(409, message, details, code);
  }
}
