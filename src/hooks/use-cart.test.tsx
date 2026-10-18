import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCart } from "./use-cart";
import { CART_STORAGE_KEY } from "@/lib/cart";
const catalog = [{ id: 1, name: "Agenda", price: 24500, colors: ["Azul", "Amarillo"], image: "agenda" }];
describe("Persistent cart", () => {
  beforeEach(() => { vi.restoreAllMocks(); localStorage.clear(); });
  it("restores cart after remount and only clears on explicit completion", async () => {
    const first = renderHook(() => useCart(catalog));
    act(() => first.result.current.add(1, "Azul"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]")).toEqual([{ id: 1, color: "Azul", quantity: 1 }]));
    first.unmount();
    const second = renderHook(() => useCart(catalog));
    expect(second.result.current.cart).toEqual([{ id: 1, color: "Azul", quantity: 1 }]);
    act(() => second.result.current.quantity(1, "Azul", 2));
    expect(second.result.current.cart[0]?.quantity).toBe(2);
    act(() => second.result.current.complete());
    expect(second.result.current.cart).toEqual([]);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe("[]");
  });
  it("removes an individual variant without removing another", () => {
    const hook = renderHook(() => useCart(catalog));
    act(() => { hook.result.current.add(1, "Azul"); hook.result.current.add(1, "Amarillo"); });
    act(() => hook.result.current.remove(1, "Azul"));
    expect(hook.result.current.cart).toEqual([{ id: 1, color: "Amarillo", quantity: 1 }]);
  });
  it("recovers safely from malformed stored data", () => {
    localStorage.setItem(CART_STORAGE_KEY, "not json");
    const hook = renderHook(() => useCart(catalog));
    expect(hook.result.current.cart).toEqual([]);
    expect(hook.result.current.error).not.toBe("");
  });
});