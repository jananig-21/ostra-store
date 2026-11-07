import type { Category, Product } from "../data/products";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "new";

export interface Filters {
  q: string;
  categories: Category[];
  colors: string[];
  maxPrice: number | null; // cents
  inStockOnly: boolean;
  sort: SortKey;
}

export const defaultFilters: Filters = {
  q: "",
  categories: [],
  colors: [],
  maxPrice: null,
  inStockOnly: false,
  sort: "featured",
};

const SORTS: SortKey[] = ["featured", "price-asc", "price-desc", "rating", "new"];

/** Lower-cases and strips accents so "cafe" matches "Café". */
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

/** Every word of the query must appear in the product's searchable text. */
export function matchesQuery(p: Product, q: string): boolean {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalize([p.name, p.category, p.blurb, ...p.colors.map((c) => c.name)].join(" "));
  return terms.every((t) => haystack.includes(t));
}

export function applyFilters(list: Product[], f: Filters): Product[] {
  const out = list.filter(
    (p) =>
      matchesQuery(p, f.q) &&
      (f.categories.length === 0 || f.categories.includes(p.category)) &&
      (f.colors.length === 0 || p.colors.some((c) => f.colors.includes(c.name))) &&
      (f.maxPrice === null || p.price <= f.maxPrice) &&
      (!f.inStockOnly || p.stock > 0),
  );
  // copy before sorting; Array.prototype.sort is stable, so ties keep catalogue order
  switch (f.sort) {
    case "price-asc":
      return [...out].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...out].sort((a, b) => b.price - a.price);
    case "rating":
      return [...out].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "new":
      return [...out].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    default:
      return out;
  }
}

/** Filters live in the URL so every filtered view can be shared or bookmarked. */
export function filtersFromParams(params: URLSearchParams): Filters {
  const sort = params.get("sort") as SortKey | null;
  const max = Number(params.get("max"));
  return {
    q: params.get("q") ?? "",
    categories: (params.get("cat")?.split(",").filter(Boolean) ?? []) as Category[],
    colors: params.get("color")?.split(",").filter(Boolean) ?? [],
    maxPrice: params.has("max") && Number.isFinite(max) && max > 0 ? Math.round(max * 100) : null,
    inStockOnly: params.get("stock") === "1",
    sort: sort && SORTS.includes(sort) ? sort : "featured",
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.categories.length) p.set("cat", f.categories.join(","));
  if (f.colors.length) p.set("color", f.colors.join(","));
  if (f.maxPrice !== null) p.set("max", String(f.maxPrice / 100));
  if (f.inStockOnly) p.set("stock", "1");
  if (f.sort !== "featured") p.set("sort", f.sort);
  return p;
}
