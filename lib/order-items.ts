// orders.items is a jsonb column: Supabase returns it already parsed as an array
// of { name, item_id, quantity, unit_price } objects. Legacy rows may still hold a
// JSON string. Renderers must never receive the raw array/objects as React children.

type OrderItemLine = { name?: unknown; quantity?: unknown };

export function formatOrderItems(items: unknown): string {
  let list: unknown[] = [];
  if (Array.isArray(items)) {
    list = items;
  } else if (typeof items === 'string' && items.trim()) {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [];
    }
  }

  return list
    .map((line) => {
      if (!line || typeof line !== 'object') return '';
      const { name, quantity } = line as OrderItemLine;
      if (typeof name !== 'string' || !name) return '';
      const qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
      return `${qty}× ${name}`;
    })
    .filter(Boolean)
    .join('، ');
}
