import { describe, expect, it } from "vitest";
import { products } from "../data/products";
import { applyFilters, defaultFilters, filtersFromParams, filtersToParams, matchesQuery, type Filters } from "../lib/filters";
import { computeTotals, formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "../lib/pricing";
import { validatePassword, validateShipping } from "../lib/validation";
import { hashPassword, newSalt, safeEqual } from "../lib/crypto";
import { cartReducer, lineKey, MAX_PER_LINE, type CartState } from "../store/cart";

const empty: CartState = { lines: [], promo: null };

describe("cartReducer", () => {
  it("merges the same product, colour and size into one line", () => {
    let s = cartReducer(empty, { type: "add", productId: "dune-mug", color: "Clay", qty: 1 });
    s = cartReducer(s, { type: "add", productId: "dune-mug", color: "Clay", qty: 2 });
    s = cartReducer(s, { type: "add", productId: "dune-mug", color: "Ink", qty: 1 });
    expect(s.lines).toHaveLength(2);
    expect(s.lines[0]).toMatchObject({ key: lineKey("dune-mug", "Clay"), qty: 3 });
  });

  it("caps quantity at stock and at the per-line maximum", () => {
    const lowStock = products.find((p) => p.stock > 0 && p.stock < MAX_PER_LINE)!;
    const s = cartReducer(empty, { type: "add", productId: lowStock.id, color: lowStock.colors[0]!.name, qty: 99 });
    expect(s.lines[0]!.qty).toBe(lowStock.stock);
    const plenty = cartReducer(empty, { type: "add", productId: "dune-mug", color: "Clay", qty: 99 });
    expect(plenty.lines[0]!.qty).toBe(MAX_PER_LINE);
  });

  it("never adds sold-out products", () => {
    const soldOut = products.find((p) => p.stock === 0)!;
    expect(cartReducer(empty, { type: "add", productId: soldOut.id, color: soldOut.colors[0]!.name, qty: 1 })).toBe(empty);
  });

  it("removes a line when quantity drops to 0 and restores it at the same position", () => {
    let s = cartReducer(empty, { type: "add", productId: "dune-mug", color: "Clay", qty: 1 });
    s = cartReducer(s, { type: "add", productId: "ember-candle", color: "Amber", qty: 1 });
    s = cartReducer(s, { type: "add", productId: "field-throw", color: "Oat", qty: 1 });
    const removed = s.lines[1]!;
    s = cartReducer(s, { type: "setQty", key: removed.key, qty: 0 });
    expect(s.lines.map((l) => l.productId)).toEqual(["dune-mug", "field-throw"]);
    s = cartReducer(s, { type: "restore", line: removed, index: 1 });
    expect(s.lines.map((l) => l.productId)).toEqual(["dune-mug", "ember-candle", "field-throw"]);
  });
});

describe("computeTotals", () => {
  it("charges flat shipping below the threshold and none above it", () => {
    expect(computeTotals(5000).shipping).toBe(SHIPPING_FLAT);
    expect(computeTotals(FREE_SHIPPING_THRESHOLD).shipping).toBe(0);
    expect(computeTotals(0)).toMatchObject({ shipping: 0, total: 0 });
  });

  it("applies the promo before shipping and tax, in whole cents", () => {
    const t = computeTotals(16000, "WELCOME10"); // $160 - 10% = $144, below free shipping
    expect(t).toMatchObject({ discount: 1600, shipping: SHIPPING_FLAT, tax: 864, total: 14400 + SHIPPING_FLAT + 864, toFreeShipping: 600 });
    expect(Number.isInteger(computeTotals(3333, "STUDIO20").total)).toBe(true);
  });

  it("ignores unknown promo codes", () => {
    expect(computeTotals(10000, "FAKE").discount).toBe(0);
  });

  it("formats cents as US dollars", () => {
    expect(formatPrice(123456)).toBe("$1,234.56");
  });
});

describe("filters", () => {
  const f = (patch: Partial<Filters>) => ({ ...defaultFilters, ...patch });

  it("matches every word, ignoring case and accents", () => {
    const vase = products.find((p) => p.id === "tide-vase")!;
    expect(matchesQuery(vase, "TIDE ceramics")).toBe(true);
    expect(matchesQuery(vase, "tidé")).toBe(true);
    expect(matchesQuery(vase, "tide linen")).toBe(false);
  });

  it("combines category, colour, price and stock filters", () => {
    const out = applyFilters(products, f({ categories: ["Ceramics"], colors: ["Clay"], maxPrice: 5000, inStockOnly: true }));
    expect(out.length).toBeGreaterThan(0);
    for (const p of out) {
      expect(p.category).toBe("Ceramics");
      expect(p.colors.some((c) => c.name === "Clay")).toBe(true);
      expect(p.price).toBeLessThanOrEqual(5000);
      expect(p.stock).toBeGreaterThan(0);
    }
  });

  it("sorts without mutating the catalogue", () => {
    const before = products.map((p) => p.id);
    const asc = applyFilters(products, f({ sort: "price-asc" }));
    expect(asc.map((p) => p.price)).toEqual([...asc.map((p) => p.price)].sort((a, b) => a - b));
    expect(products.map((p) => p.id)).toEqual(before);
  });

  it("round-trips through URL params", () => {
    const original = f({ q: "linen", categories: ["Textiles", "Glass"], colors: ["Oat"], maxPrice: 15000, inStockOnly: true, sort: "rating" });
    expect(filtersFromParams(filtersToParams(original))).toEqual(original);
  });

  it("falls back to defaults for malformed params", () => {
    expect(filtersFromParams(new URLSearchParams("sort=bogus&max=abc"))).toEqual(defaultFilters);
  });
});

describe("validation", () => {
  it("flags each invalid shipping field", () => {
    const errs = validateShipping({ fullName: "J", email: "not-an-email", address: "1", city: "", state: "Michigan", zip: "4810" });
    expect(Object.keys(errs).sort()).toEqual(["address", "city", "email", "fullName", "state", "zip"]);
  });

  it("accepts a valid address", () => {
    expect(validateShipping({ fullName: "Ada Lovelace", email: "ada@example.com", address: "500 S State St", city: "Ann Arbor", state: "mi", zip: "48109" })).toEqual({});
  });

  it("requires 8+ characters with a letter and a number", () => {
    expect(validatePassword("short1")).toBeDefined();
    expect(validatePassword("longpassword")).toBeDefined();
    expect(validatePassword("longpass1")).toBeUndefined();
  });
});

describe("password hashing", () => {
  it("is deterministic per salt and differs across salts", async () => {
    const salt = newSalt();
    const a = await hashPassword("hunter22", salt);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(safeEqual(a, await hashPassword("hunter22", salt))).toBe(true);
    expect(safeEqual(a, await hashPassword("hunter22", newSalt()))).toBe(false);
    expect(safeEqual(a, await hashPassword("hunter23", salt))).toBe(false);
  });
});
