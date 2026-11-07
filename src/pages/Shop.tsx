import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { allColors, categories, products, type Category } from "../data/products";
import { applyFilters, defaultFilters, filtersFromParams, filtersToParams, type Filters, type SortKey } from "../lib/filters";
import { formatPrice } from "../lib/pricing";
import { useDebounced } from "../hooks/useDebounced";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { ProductCard } from "../components/ProductCard";
import { CloseIcon, FilterIcon, SearchIcon } from "../components/Icons";

const PRICE_STEPS = [5000, 10000, 15000, 25000];
const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
  new: "Newest",
};

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const [query, setQuery] = useState(filters.q);
  const debouncedQuery = useDebounced(query, 200);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  useFocusTrap(sheetRef, sheetOpen, () => setSheetOpen(false));
  useDocumentTitle(filters.categories.length === 1 ? filters.categories[0] : "Shop");

  // replace (not push) history entries so Back leaves the shop instead of undoing each keystroke
  const update = (patch: Partial<Filters>) => setParams(filtersToParams({ ...filters, ...patch }), { replace: true });

  useEffect(() => {
    if (debouncedQuery !== filters.q) update({ q: debouncedQuery });
  }, [debouncedQuery]);

  // keep the box in sync when the URL changes from elsewhere (header links, search palette)
  useEffect(() => setQuery(filters.q), [filters.q]);

  const results = useMemo(() => applyFilters(products, filters), [filters]);

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const chips: { label: string; clear: () => void }[] = [
    ...filters.categories.map((c) => ({ label: c, clear: () => update({ categories: filters.categories.filter((x) => x !== c) }) })),
    ...filters.colors.map((c) => ({ label: c, clear: () => update({ colors: filters.colors.filter((x) => x !== c) }) })),
    ...(filters.maxPrice !== null ? [{ label: `Under ${formatPrice(filters.maxPrice)}`, clear: () => update({ maxPrice: null }) }] : []),
    ...(filters.inStockOnly ? [{ label: "In stock", clear: () => update({ inStockOnly: false }) }] : []),
    ...(filters.q ? [{ label: `“${filters.q}”`, clear: () => { setQuery(""); update({ q: "" }); } }] : []),
  ];

  const panel = (
    <div className="filters">
      <fieldset>
        <legend>Category</legend>
        {categories.map((c) => (
          <label key={c} className="check">
            <input type="checkbox" checked={filters.categories.includes(c)} onChange={() => update({ categories: toggle<Category>(filters.categories, c) })} />
            <span>{c}</span>
            <span className="muted small">{products.filter((p) => p.category === c).length}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Colour</legend>
        <div className="color-grid">
          {allColors.map((c) => (
            <label key={c.name} className="color-check" title={c.name}>
              <input type="checkbox" checked={filters.colors.includes(c.name)} onChange={() => update({ colors: toggle(filters.colors, c.name) })} />
              <span className="swatch swatch--lg" style={{ background: c.hex }} />
              <span className="sr-only">{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Price</legend>
        <label className="check">
          <input type="radio" name="price" checked={filters.maxPrice === null} onChange={() => update({ maxPrice: null })} />
          <span>Any price</span>
        </label>
        {PRICE_STEPS.map((p) => (
          <label key={p} className="check">
            <input type="radio" name="price" checked={filters.maxPrice === p} onChange={() => update({ maxPrice: p })} />
            <span>Under {formatPrice(p)}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Availability</legend>
        <label className="check">
          <input type="checkbox" checked={filters.inStockOnly} onChange={() => update({ inStockOnly: !filters.inStockOnly })} />
          <span>In stock only</span>
        </label>
      </fieldset>
    </div>
  );

  return (
    <div className="shop">
      <header className="shop__head">
        <h1 className="display-sm">{filters.categories.length === 1 ? filters.categories[0] : "The collection"}</h1>
        <div className="shop__search">
          <SearchIcon />
          <label htmlFor="shop-q" className="sr-only">Search products</label>
          <input id="shop-q" type="search" placeholder="Search the collection" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </header>

      <div className="shop__body">
        <aside className="shop__aside" aria-label="Filters">{panel}</aside>

        <section className="shop__results" aria-labelledby="results-count">
          <div className="toolbar">
            <p id="results-count" aria-live="polite">
              {results.length} {results.length === 1 ? "product" : "products"}
            </p>
            <div className="toolbar__right">
              <button className="btn btn--ghost btn--sm shop__filter-btn" onClick={() => setSheetOpen(true)} aria-expanded={sheetOpen} aria-controls="filter-sheet">
                <FilterIcon /> Filters {chips.length > 0 && `(${chips.length})`}
              </button>
              <label className="select">
                <span className="sr-only">Sort by</span>
                <select value={filters.sort} onChange={(e) => update({ sort: e.target.value as SortKey })}>
                  {Object.entries(SORT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="chips" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.label}>
                  <button className="chip" onClick={c.clear} aria-label={`Remove filter ${c.label}`}>
                    {c.label} <CloseIcon width={14} height={14} />
                  </button>
                </li>
              ))}
              <li>
                <button className="link-btn" onClick={() => { setQuery(""); setParams(filtersToParams(defaultFilters), { replace: true }); }}>
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {results.length === 0 ? (
            <div className="empty">
              <p className="display-sm">Nothing matches those filters.</p>
              <p className="muted">Try removing a filter or searching for something broader, like “vase” or “linen”.</p>
              <button className="btn btn--primary" onClick={() => { setQuery(""); setParams(new URLSearchParams(), { replace: true }); }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid--shop">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}
        </section>
      </div>

      {sheetOpen && (
        <div className="sheet" id="filter-sheet" onMouseDown={(e) => e.target === e.currentTarget && setSheetOpen(false)}>
          <div className="sheet__panel" ref={sheetRef} role="dialog" aria-modal="true" aria-label="Filters">
            <header className="drawer__head">
              <h2>Filters</h2>
              <button className="icon-btn" aria-label="Close filters" onClick={() => setSheetOpen(false)}>
                <CloseIcon />
              </button>
            </header>
            {panel}
            <button className="btn btn--primary btn--block" onClick={() => setSheetOpen(false)}>
              Show {results.length} {results.length === 1 ? "product" : "products"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
