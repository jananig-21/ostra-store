import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct } from "../data/products";
import { load, save } from "../lib/storage";

const KEY = "ostra.wishlist.v1";
const isIdList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string" && !!getProduct(x));

interface WishlistValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean; // returns the new state
}

const WishlistContext = createContext<WishlistValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => load(KEY, [], isIdList));
  useEffect(() => save(KEY, ids), [ids]);

  const value = useMemo<WishlistValue>(() => {
    const set = new Set(ids);
    return {
      ids,
      has: (id) => set.has(id),
      toggle: (id) => {
        const adding = !set.has(id);
        setIds((cur) => (adding ? [...cur, id] : cur.filter((x) => x !== id)));
        return adding;
      },
    };
  }, [ids]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
