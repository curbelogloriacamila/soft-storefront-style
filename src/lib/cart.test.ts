import { describe, expect, it } from "vitest";
import { addToCart, cartSummary, moneyCents, normalizeCart, orderMessage, updateQuantity, whatsappOrderUrl } from "./cart";
import { TRANSFER_ALIAS, WHATSAPP_NUMBER, WHATSAPP_URL } from "./store-config";

const catalog = [{ id: 1, name: "Agenda 2027 azul", price: 24500, colors: ["Azul", "Amarillo"], image: "agenda" }, { id: 2, name: "Planner Mi semana", price: 12500, colors: ["Lila", "Salvia"], image: "planner" }];
describe("Cart rules", () => {
  it("merges identical variants without merging different ones", () => {
    let cart = addToCart([], 1, "Azul", catalog);
    cart = addToCart(cart, 1, "Azul", catalog);
    cart = addToCart(cart, 1, "Amarillo", catalog);
    expect(cart).toEqual([{ id: 1, color: "Azul", quantity: 2 }, { id: 1, color: "Amarillo", quantity: 1 }]);
  });
  it("rejects quantities below one or noninteger quantities", () => {
    const cart = [{ id: 1, color: "Azul", quantity: 1 }];
    for (const invalid of [0, -1, 1.5, NaN, Infinity]) expect(updateQuantity(cart, 1, "Azul", invalid, catalog)).toEqual(cart);
  });
  it("discards unavailable products and variants", () => {
    expect(normalizeCart([{ id: 999, color: "Azul", quantity: 1 }, { id: 1, color: "Rojo", quantity: 1 }], catalog)).toEqual([]);
  });
  it("uses only catalog prices and computes product subtotal and total", () => {
    const input = [{ id: 1, color: "Azul", quantity: 2, price: -500 }, { id: 2, color: "Lila", quantity: 1 }];
    const summary = cartSummary(input, catalog);
    expect(summary.lines.map(line => line.subtotalCents)).toEqual([4900000, 1250000]);
    expect(summary.totalCents).toBe(6150000);
    expect(summary.count).toBe(3);
  });
  it("rejects negative prices and unsafe totals", () => {
    expect(cartSummary([{ id: 1, color: "Azul", quantity: 1 }], [{ ...catalog[0], price: -1 }]).totalCents).toBe(0);
    expect(normalizeCart([{ id: 1, color: "Azul", quantity: Number.MAX_SAFE_INTEGER }], catalog)).toEqual([]);
  });
  it("calculates fractional ARS prices in integer cents", () => {
    const summary = cartSummary([{ id: 1, color: "Azul", quantity: 3 }], [{ ...catalog[0], price: 10.1 }]);
    expect(summary.totalCents).toBe(3030);
    expect(moneyCents(summary.totalCents)).toContain("30,3");
  });
  it("reuses the existing contact number for encoded order messages", () => {
    const cart = [{ id: 1, color: "Azul", quantity: 2 }];
    const message = orderMessage(cart, catalog);
    const url = whatsappOrderUrl(message);
    expect(WHATSAPP_NUMBER).toBe("5491135875068");
    expect(WHATSAPP_URL).toContain("wa.me/5491135875068");
    expect(url).toBe(`https://wa.me/5491135875068?text=${encodeURIComponent(message)}`);
    expect(decodeURIComponent(new URL(url ?? "").search.slice(6))).toBe(message);
    expect(message).toContain("Agenda 2027 azul — Azul × 2");
    expect(message).toContain("💰 Total de los productos: $ 49.000");
    expect(message).toContain("\n\n🛍️ Mi pedido:\n");
    expect(message).toContain("Alias: campanella.papeleria");
  });
  it("generates receipt messages with current quantities and total", () => {
    const message = orderMessage([{ id: 2, color: "Salvia", quantity: 3 }], catalog, true);
    expect(message).toContain("Planner Mi semana — Salvia × 3");
    expect(message).toContain("💰 Importe transferido: $ 37.500");
    expect(message).toContain("Les envío el comprobante para que puedan verificar el pago.");
    expect(TRANSFER_ALIAS).toBe("campanella.papeleria");
  });
  it("does not create WhatsApp order links for empty carts", () => {
    expect(whatsappOrderUrl(orderMessage([], catalog))).toBeNull();
  });
});