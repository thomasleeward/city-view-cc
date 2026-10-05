// Absent overrides retain the website's own button design. Validate legacy data too.
export function buttonColors(action: { colors?: unknown } | undefined) {
  const colors = action?.colors;
  if (!colors || typeof colors !== 'object') return {};
  const value = colors as Record<string, unknown>;
  const valid = (color: unknown): color is string => typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color);
  return {
    ...(valid(value.background) ? { backgroundColor: value.background, borderColor: value.background } : {}),
    ...(valid(value.text) ? { color: value.text } : {}),
  };
}
