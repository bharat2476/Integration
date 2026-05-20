export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class TenantError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, "TENANT_REQUIRED", details);
    this.name = "TenantError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 422, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class IntegrationError extends AppError {
  constructor(system: string, message: string, details?: Record<string, unknown>) {
    super(`${system}: ${message}`, 502, "INTEGRATION_ERROR", { system, ...details });
    this.name = "IntegrationError";
  }
}
