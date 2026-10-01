export type ErrorCode = "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INTEGRATION_UNAVAILABLE" | "INTERNAL";

const STATUS: Record<ErrorCode, number> = { BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, INTEGRATION_UNAVAILABLE: 503, INTERNAL: 500 };

export class ApiError extends Error {
  constructor(public code: ErrorCode, message: string) {
    super(message);
  }
  get status() {
    return STATUS[this.code];
  }
}
