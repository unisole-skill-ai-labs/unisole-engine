/**
 * Converts a string to Title Case (e.g., "john doe" -> "John Doe", "RAHUL SHARMA" -> "Rahul Sharma")
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (char) => char.toUpperCase());
}

/**
 * Normalizes email by trimming and converting to lowercase
 */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Normalizes phone number to 10 clean digits
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== "string") return null;
  const cleaned = phone.replace(/\D/g, "");
  const tenDigit = cleaned.slice(-10);
  return tenDigit.length === 10 ? tenDigit : null;
}
