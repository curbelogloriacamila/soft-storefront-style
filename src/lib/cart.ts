import { TRANSFER_ALIAS, WHATSAPP_NUMBER } from "./store-config";

export type CartProduct = { id: number; name: string; price: number; colors: string[]; image: string; cover?: boolean };
export type CartItem = { id: number; color: string; quantity: number };
export type CartLine = CartItem & { product: CartProduct; unitCents: number; subtotalCents: number };
export const CART_STORAGE_KEY = "campanella.cart.v1";
const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const money = (pesos: number) => currency.format(pesos);
export const moneyCents = (cents: number) => money(cents / 100);

function priceCents(product: CartProduct) {
  const cents = Math.round(product.price * 100);
  return Number.isFinite(product.price) && product.price >= 0 && Number.isSafeInteger(cents) ? cents : null;
}

// Storage is untrusted: only identifiers/variants/quantities are saved; prices always come from the catalog.
export function normalizeCart(input: unknown, catalog: readonly CartProduct[]): CartItem[] {
  if (!Array.isArray(input)) return [];
  const result: CartItem[] = [];
  let runningTotal = 0;
  for (const candidate of input) {
    if (!candidate || typeof candidate !== "object") continue;
    const { id, color, quantity } = candidate as Partial<CartItem>;
    const product = catalog.find(p => p.id === id);
    if (!product || typeof color !== "string" || !product.colors.includes(color) || typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 1) continue;
    const cents = priceCents(product);
    if (cents === null || !Number.isSafeInteger(cents * quantity) || !Number.isSafeInteger(runningTotal + cents * quantity)) continue;
    const existing = result.find(item => item.id === id && item.color === color);
    if (existing && !Number.isSafeInteger(existing.quantity + quantity)) continue;
    if (existing) existing.quantity += quantity;
    else result.push({ id: product.id, color, quantity });
    runningTotal += cents * quantity;
  }
  return result;
}

export function addToCart(cart: CartItem[], id: number, color: string, catalog: readonly CartProduct[]) {
  return normalizeCart([...cart, { id, color, quantity: 1 }], catalog);
}

export function updateQuantity(cart: CartItem[], id: number, color: string, quantity: number, catalog: readonly CartProduct[]) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return cart;
  const updated = cart.map(item => item.id === id && item.color === color ? { ...item, quantity } : item);
  const normalized = normalizeCart(updated, catalog);
  // Reject overflow instead of inadvertently removing an existing item.
  return normalized.length === updated.length ? normalized : cart;
}

export function cartSummary(cart: CartItem[], catalog: readonly CartProduct[]) {
  const lines: CartLine[] = [];
  for (const item of normalizeCart(cart, catalog)) {
    const product = catalog.find(p => p.id === item.id);
    if (!product) continue;
    const unitCents = priceCents(product);
    if (unitCents === null) continue;
    lines.push({ ...item, product, unitCents, subtotalCents: unitCents * item.quantity });
  }
  return { lines, totalCents: lines.reduce((sum, line) => sum + line.subtotalCents, 0), count: lines.reduce((sum, line) => sum + line.quantity, 0) };
}

export function orderMessage(cart: CartItem[], catalog: readonly CartProduct[], receipt = false) {
  const { lines, totalCents } = cartSummary(cart, catalog);
  if (!lines.length) return "";
  const list = lines.map(line => `• ${line.product.name} — ${line.color} × ${line.quantity} (${moneyCents(line.unitCents)} c/u; subtotal ${moneyCents(line.subtotalCents)})`).join("\n");
  if (receipt) return `¡Hola, Campanella! 🌷 Ya realicé la transferencia de mi pedido.\n\n🛍️ Pedido:\n${list}\n💰 Importe transferido: ${moneyCents(totalCents)}\n\nLes envío el comprobante para que puedan verificar el pago.\n\n¿Me confirman la recepción y coordinamos el envío o la entrega?\n\n¡Gracias! 💗`;
  return `¡Hola, Campanella! 🌷 Quiero confirmar mi pedido.\n\n🛍️ Mi pedido:\n${list}\n\n💰 Total de los productos: ${moneyCents(totalCents)}\n\n💳 Medio de pago: Transferencia bancaria.\nAlias: ${TRANSFER_ALIAS}\n\n📦 Quisiera coordinar el envío o la entrega de mi pedido.\n\n¿Me indican las opciones disponibles y el costo de envío, si corresponde?\n\n¡Muchas gracias! 💗`;
}

export function whatsappOrderUrl(message: string) {
  if (!message || !/^\d{8,15}$/.test(WHATSAPP_NUMBER)) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}