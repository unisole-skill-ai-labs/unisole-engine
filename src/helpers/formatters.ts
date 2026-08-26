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
 * Normalizes phone number to E.164 format: +91XXXXXXXXXX
 * Accepts: "9876543210", "+919876543210", "919876543210", "09876543210"
 * Returns: "+919876543210" or null if invalid
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "");
  let tenDigit: string;
  if (digits.length > 10 && digits.startsWith("91")) {
    tenDigit = digits.slice(-10);
  } else if (digits.length === 10) {
    tenDigit = digits;
  } else {
    return null;
  }
  return `+91${tenDigit}`;
}
