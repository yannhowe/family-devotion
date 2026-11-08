const translationNames: Record<string, string> = {
  WEB: "World English Bible",
  KJV: "King James Version",
  ESV: "ESV",
};

export function translationName(code: string) {
  const trimmed = code.trim();
  return translationNames[trimmed.toUpperCase()] ?? trimmed;
}

export function excerpt(text: string, max = 220) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const end = lastSpace > 80 ? lastSpace : max;
  return `${slice.slice(0, end)}…`;
}

export function normalizeTranslation(value: string) {
  const trimmed = value.trim();
  if (/^[a-z]{2,8}$/i.test(trimmed)) return trimmed.toUpperCase();
  return trimmed.slice(0, 40);
}
