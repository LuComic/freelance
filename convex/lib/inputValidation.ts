import { invalidState } from "./errors";

export function assertMaxLength(
  value: string,
  maxLength: number,
  fieldLabel: string,
) {
  if (value.length > maxLength) {
    throw invalidState(`${fieldLabel} must be ${maxLength} characters or less.`);
  }
}
