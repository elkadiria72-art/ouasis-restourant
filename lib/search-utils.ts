/** Case-insensitive real-time search helper */

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearch(
  query: string,
  ...fields: (string | number | boolean | null | undefined)[]
): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) return true;
  return fields.some((field) => String(field ?? '').toLowerCase().includes(q));
}
