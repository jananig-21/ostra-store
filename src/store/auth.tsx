import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { hashPassword, newSalt, safeEqual } from "../lib/crypto";
import { load, save } from "../lib/storage";
import type { ShippingForm } from "../lib/validation";
import type { Totals } from "../lib/pricing";

export interface OrderItem {
  productId: string;
  name: string;
  color: string;
  size?: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  placedAt: string;
  items: OrderItem[];
  totals: Totals;
  shipping: ShippingForm;
  promo: string | null;
}

interface StoredUser {
  name: string;
  email: string;
  salt: string;
  hash: string;
  orders: Order[];
}

export interface User {
  name: string;
  email: string;
  orders: Order[];
}

const USERS_KEY = "ostra.users.v1";
const SESSION_KEY = "ostra.session.v1";

type Users = Record<string, StoredUser>;
const isUsers = (v: unknown): v is Users => typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === "string";

interface AuthValue {
  user: User | null;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => void;
  recordOrder: (order: Order) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<Users>(() => load(USERS_KEY, {}, isUsers));
  const [session, setSession] = useState<string | null>(() => load<string | null>(SESSION_KEY, null, (v): v is string | null => v === null || isString(v)));

  useEffect(() => save(USERS_KEY, users), [users]);
  useEffect(() => save(SESSION_KEY, session), [session]);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const id = email.trim().toLowerCase();
      if (users[id]) return "An account with this email already exists. Sign in instead.";
      const salt = newSalt();
      const hash = await hashPassword(password, salt);
      setUsers((u) => ({ ...u, [id]: { name: name.trim(), email: id, salt, hash, orders: [] } }));
      setSession(id);
      return null;
    },
    [users],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const stored = users[email.trim().toLowerCase()];
      // same message either way, so the form doesn't reveal which emails have accounts
      const failure = "That email and password don't match.";
      if (!stored) return failure;
      const hash = await hashPassword(password, stored.salt);
      if (!safeEqual(hash, stored.hash)) return failure;
      setSession(stored.email);
      return null;
    },
    [users],
  );

  const value = useMemo<AuthValue>(() => {
    const stored = session ? users[session] : undefined;
    return {
      user: stored ? { name: stored.name, email: stored.email, orders: stored.orders } : null,
      signUp,
      signIn,
      signOut: () => setSession(null),
      recordOrder: (order) => {
        if (!session) return;
        setUsers((u) => {
          const cur = u[session];
          return cur ? { ...u, [session]: { ...cur, orders: [order, ...cur.orders] } } : u;
        });
      },
    };
  }, [session, users, signUp, signIn]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
