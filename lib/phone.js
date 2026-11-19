export function normalizeBangladeshiPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("880")) return `0${digits.slice(3)}`;
  return digits;
}
