import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { products } from "../data/products";
import { matchesQuery } from "../lib/filters";
import { formatPrice } from "../lib/pricing";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { ArrowIcon, SearchIcon } from "./Icons";
import { ProductArt } from "./ProductArt";

/** Command-palette search (⌘K / Ctrl+K / "/") following the ARIA combobox + listbox pattern. */
export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useFocusTrap(panel, open, onClose, input);

  const results = useMemo(() => (q.trim() ? products.filter((p) => matchesQuery(p, q)).slice(0, 6) : products.filter((p) => p.isNew)), [q]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  if (!open) return null;

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  // the products, plus a "see all results" option while typing
  const optionCount = results.length + (q.trim() ? 1 : 0);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, optionCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      go(hit ? `/product/${hit.id}` : `/shop?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const optionId = (i: number) => `search-opt-${i}`;

  return (
    <div className="palette" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} className="palette__panel" role="dialog" aria-modal="true" aria-label="Search products">
        <div className="palette__input">
          <SearchIcon />
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls="search-list"
            aria-activedescendant={optionCount ? optionId(active) : undefined}
            aria-autocomplete="list"
            placeholder="Search vases, linen, candles…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd>esc</kbd>
        </div>
        <p className="palette__label">{q.trim() ? `${results.length ? "Products" : "No matching products"}` : "New this season"}</p>
        <ul id="search-list" role="listbox" className="palette__list">
          {results.map((p, i) => (
            <li
              key={p.id}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className={i === active ? "is-active" : ""}
              onMouseMove={() => setActive(i)}
              onClick={() => go(`/product/${p.id}`)}
            >
              <span className="palette__thumb">
                <ProductArt shape={p.shape} color={p.colors[0]!.hex} label="" />
              </span>
              <span className="palette__name">
                {p.name}
                <small>{p.category}</small>
              </span>
              <span className="palette__price">{formatPrice(p.price)}</span>
            </li>
          ))}
          {q.trim() && (
            <li
              id={optionId(results.length)}
              role="option"
              aria-selected={active === results.length}
              className={`palette__all ${active === results.length ? "is-active" : ""}`}
              onMouseMove={() => setActive(results.length)}
              onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}
            >
              See all results for “{q.trim()}” <ArrowIcon width={16} height={16} />
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
