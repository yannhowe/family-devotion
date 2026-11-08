export function unwrapStoredValue(raw: string | undefined) {
  let value = raw?.trim() ?? "";
  if (!value) return undefined;

  if (value.startsWith("b64:")) {
    value = Buffer.from(value.slice(4), "base64").toString("utf8").trim();
  } else if (value.startsWith("sep:")) {
    value = value.slice(4).replaceAll(",", "").trim();
  }

  return value || undefined;
}
