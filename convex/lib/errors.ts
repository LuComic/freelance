export const APP_ERROR_CODES = {
  unauthorized: "UNAUTHORIZED",
  notFound: "NOT_FOUND",
  invalidState: "INVALID_STATE",
  duplicateSlug: "DUPLICATE_SLUG",
  duplicateInvite: "DUPLICATE_INVITE",
  duplicateConnection: "DUPLICATE_CONNECTION",
} as const;

export type AppErrorCode =
  (typeof APP_ERROR_CODES)[keyof typeof APP_ERROR_CODES];

export class ConvexDomainError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ConvexDomainError";
  }
}

export function invariant(condition: unknown, error: ConvexDomainError): asserts condition {
  if (!condition) {
    throw error;
  }
}

export function notFound(message: string) {
  return new ConvexDomainError(APP_ERROR_CODES.notFound, message);
}

export function unauthorized(message = "You must be signed in to perform this action.") {
  return new ConvexDomainError(APP_ERROR_CODES.unauthorized, message);
}

export function invalidState(message: string) {
  return new ConvexDomainError(APP_ERROR_CODES.invalidState, message);
}
