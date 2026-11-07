import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { getProduct, type Product } from "../data/products";
import { computeTotals, PROMO_CODES, type Totals } from "../lib/pricing";
import { load, save } from "../lib/storage";

export const MAX_PER_LINE = 10;

export interface CartLine {
  key: string;
  productId: string;
  color: string;
  size?: string;
  qty: number;
}

export interface CartState {
  lines: CartLine[];
  promo: string | null;
}

export type CartAction =
  | { type: "add"; productId: string; color: string; size?: string; qty: number }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "restore"; line: CartLine; index: number }
  | { type: "clear" }
  | { type: "setPromo"; code: string | null }
  | { type: "replace"; state: CartState };

export const lineKey = (productId: string, color: string, size?: string) => [productId, color, size ?? ""].join("|");

/** Quantity is clamped to what is in stock and to a per-line maximum. */
function clampQty(productId: string, qty: number): number {
  const stock = getProduct(productId)?.stock ?? 0;
  return Math.max(0, Math.min(qty, stock, MAX_PER_LINE));
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const key = lineKey(action.productId, action.color, action.size);
      const existing = state.lines.find((l) => l.key === key);
      const qty = clampQty(action.productId, (existing?.qty ?? 0) + action.qty);
      if (qty === 0) return state;
      if (existing) {
        return { ...state, lines: state.lines.map((l) => (l.key === key ? { ...l, qty } : l)) };
      }
      const line: CartLine = { key, productId: action.productId, color: action.color, size: action.size, qty };
      return { ...state, lines: [...state.lines, line] };
    }
    case "setQty": {
      const line = state.lines.find((l) => l.key === action.key);
      if (!line) return state;
      const qty = clampQty(line.productId, action.qty);
      return {
        ...state,
        lines: qty === 0 ? state.lines.filter((l) => l.key !== action.key) : state.lines.map((l) => (l.key === action.key ? { ...l, qty } : l)),
      };
    }
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };
    case "restore": {
      if (state.lines.some((l) => l.key === action.line.key)) return state;
      const lines = [...state.lines];
      lines.splice(Math.min(action.index, lines.length), 0, action.line);
      return { ...state, lines };
    }
    case "clear":
      return { lines: [], promo: null };
    case "setPromo":
      return { ...state, promo: action.code };
    case "replace":
      return action.state;
  }
}

const STORAGE_KEY = "ostra.cart.v1";
const emptyCart: CartState = { lines: [], promo: null };

function isCartState(v: unknown): v is CartState {
  if (typeof v !== "object" || v === null) return false;
  const s = v as CartState;
  return (
    Array.isArray(s.lines) &&
    s.lines.every((l) => typeof l.key === "string" && typeof l.qty === "number" && !!getProduct(l.productId)) &&
    (s.promo === null || typeof s.promo === "string")
  );
}

export interface DetailedLine extends CartLine {
  product: Product;
  lineTotal: number;
}

interface CartContextValue {
  lines: DetailedLine[];
  count: number;
  promo: string | null;
  totals: Totals;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (productId: string, color: string, size: string | undefined, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => { line: CartLine; index: number } | null;
  restore: (line: CartLine, index: number) => void;
  clear: () => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, emptyCart, () => load(STORAGE_KEY, emptyCart, isCartState));
  const [isOpen, setOpen] = useState(false);

  useEffect(() => save(STORAGE_KEY, state), [state]);

  // keep carts in sync across open tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      dispatch({ type: "replace", state: load(STORAGE_KEY, emptyCart, isCartState) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const remove = useCallback(
    (key: string) => {
      const index = state.lines.findIndex((l) => l.key === key);
      const line = state.lines[index];
      dispatch({ type: "remove", key });
      return line ? { line, index } : null;
    },
    [state.lines],
  );

  const value = useMemo<CartContextValue>(() => {
    const lines = state.lines.flatMap((l) => {
      const product = getProduct(l.productId);
      return product ? [{ ...l, product, lineTotal: product.price * l.qty }] : [];
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      promo: state.promo,
      totals: computeTotals(subtotal, state.promo),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: (productId, color, size, qty = 1) => dispatch({ type: "add", productId, color, size, qty }),
      setQty: (key, qty) => dispatch({ type: "setQty", key, qty }),
      remove,
      restore: (line, index) => dispatch({ type: "restore", line, index }),
      clear: () => dispatch({ type: "clear" }),
      applyPromo: (code) => {
        const normalized = code.trim().toUpperCase();
        if (!PROMO_CODES[normalized]) return false;
        dispatch({ type: "setPromo", code: normalized });
        return true;
      },
      removePromo: () => dispatch({ type: "setPromo", code: null }),
    };
  }, [state, isOpen, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
