import { useEffect, useState } from "react";
import { CART_STORAGE_KEY, addToCart, normalizeCart, updateQuantity, type CartItem, type CartProduct } from "@/lib/cart";

export function useCart(catalog: readonly CartProduct[]) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function readStoredCart() {
      try {
        const saved = window.localStorage.getItem(CART_STORAGE_KEY);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        const restored = normalizeCart(parsed, catalog);
        setCart(restored);
        if (saved && JSON.stringify(restored) !== JSON.stringify(parsed)) setError("Actualizamos tu carrito: algunos productos o cantidades ya no están disponibles.");
      } catch {
        setError("No pudimos recuperar el carrito guardado. Podés volver a agregar tus productos.");
      }
    }
    readStoredCart();
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY || event.key === null) readStoredCart();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [catalog]);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }
    catch { setError("El navegador no permite guardar tu carrito. No cierres esta página antes de confirmar tu pedido."); }
  }, [cart, ready]);

  return {
    cart, ready, error,
    add: (id: number, color: string) => setCart(old => addToCart(old, id, color, catalog)),
    quantity: (id: number, color: string, value: number) => setCart(old => updateQuantity(old, id, color, value, catalog)),
    remove: (id: number, color: string) => setCart(old => old.filter(item => item.id !== id || item.color !== color)),
    complete: () => setCart([]),
  };
}