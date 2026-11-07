import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getProduct, products } from "../data/products";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "../lib/pricing";
import { load, save } from "../lib/storage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { MAX_PER_LINE, useCart } from "../store/cart";
import { useToast } from "../store/toast";
import { useWishlist } from "../store/wishlist";
import { Price, QuantityStepper, Stars, StockNote } from "../components/Bits";
import { HeartIcon } from "../components/Icons";
import { ProductArt } from "../components/ProductArt";
import { ProductCard } from "../components/ProductCard";
import NotFound from "./NotFound";

const RECENT_KEY = "ostra.recent.v1";
const isIds = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

export default function ProductPage() {
  const { id = "" } = useParams();
  const product = getProduct(id);
  const [params, setParams] = useSearchParams();
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const [size, setSize] = useState(product?.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [recent, setRecent] = useState<string[]>([]);
  useDocumentTitle(product?.name ?? "Not found");

  // the selected colour lives in the URL, so a link shares the exact colourway
  const color = product?.colors.find((c) => c.name === params.get("color")) ?? product?.colors[0];

  useEffect(() => {
    setSize(product?.sizes?.[0]);
    setQty(1);
    if (!product) return;
    const prev = load(RECENT_KEY, [], isIds).filter((x) => x !== product.id);
    setRecent(prev.filter((x) => getProduct(x)).slice(0, 4));
    save(RECENT_KEY, [product.id, ...prev].slice(0, 8));
  }, [product]);

  const related = useMemo(
    () => (product ? products.filter((p) => p.id !== product.id && p.category === product.category).concat(products.filter((p) => p.category !== product?.category)).slice(0, 4) : []),
    [product],
  );

  if (!product || !color) return <NotFound />;

  const soldOut = product.stock === 0;
  const maxQty = Math.min(MAX_PER_LINE, product.stock);
  const saved = wishlist.has(product.id);

  const addToBag = () => {
    cart.add(product.id, color.name, size, qty);
    cart.open();
  };

  return (
    <div className="pdp">
      <nav aria-label="Breadcrumb" className="crumbs">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to={`/shop?cat=${product.category}`}>{product.category}</Link></li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="pdp__grid">
        <div className="pdp__gallery">
          <div className="pdp__main" key={color.name}>
            <ProductArt shape={product.shape} color={color.hex} label={`${product.name} in ${color.name}`} />
          </div>
          <div className="pdp__thumbs" role="group" aria-label="Colourways">
            {product.colors.map((c) => (
              <button
                key={c.name}
                className={`pdp__thumb ${c.name === color.name ? "is-active" : ""}`}
                aria-label={`Show ${c.name}`}
                aria-pressed={c.name === color.name}
                onClick={() => setParams({ color: c.name }, { replace: true })}
              >
                <ProductArt shape={product.shape} color={c.hex} label="" />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp__info">
          {product.isNew && <span className="badge">New</span>}
          <h1 className="display-sm">{product.name}</h1>
          <div className="pdp__meta">
            <Price price={product.price} compareAt={product.compareAt} />
            <Stars rating={product.rating} reviews={product.reviews} />
          </div>
          <p className="lede">{product.blurb}</p>

          <fieldset className="opt">
            <legend>
              Colour: <strong>{color.name}</strong>
            </legend>
            <div className="opt__swatches">
              {product.colors.map((c) => (
                <label key={c.name} className="swatch-radio" title={c.name}>
                  <input type="radio" name="color" value={c.name} checked={c.name === color.name} onChange={() => setParams({ color: c.name }, { replace: true })} />
                  <span className="swatch swatch--xl" style={{ background: c.hex }} />
                  <span className="sr-only">{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {product.sizes && (
            <fieldset className="opt">
              <legend>
                Size: <strong>{size}</strong>
              </legend>
              <div className="opt__sizes">
                {product.sizes.map((s) => (
                  <label key={s} className="size-radio">
                    <input type="radio" name="size" value={s} checked={s === size} onChange={() => setSize(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="pdp__buy">
            {!soldOut && <QuantityStepper label="Quantity" value={qty} max={maxQty} onChange={(n) => setQty(Math.max(1, Math.min(n, maxQty)))} />}
            <button className="btn btn--primary btn--grow" onClick={addToBag} disabled={soldOut}>
              {soldOut ? "Sold out" : `Add to bag · ${formatPrice(product.price * qty)}`}
            </button>
            <button
              className={`icon-btn icon-btn--outline ${saved ? "is-on" : ""}`}
              aria-pressed={saved}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              onClick={() => {
                const added = wishlist.toggle(product.id);
                toast({ message: added ? `Saved ${product.name}` : `Removed ${product.name} from wishlist` });
              }}
            >
              <HeartIcon filled={saved} />
            </button>
          </div>
          <p className="pdp__stock">
            <StockNote stock={product.stock} /> · Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </p>

          <div className="accordion">
            <details open>
              <summary>Details</summary>
              <ul>
                {product.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </details>
            <details>
              <summary>Shipping and returns</summary>
              <p>Ships in 2–4 business days. Free returns within 30 days of delivery, in original condition.</p>
            </details>
            <details>
              <summary>Care</summary>
              <p>Handmade pieces vary slightly in colour and form. Hand washing keeps glazes and fibres at their best.</p>
            </details>
          </div>
        </div>
      </div>

      <section className="section" aria-labelledby="rel-h">
        <h2 id="rel-h" className="display-sm">You may also like</h2>
        <div className="grid">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section" aria-labelledby="recent-h">
          <h2 id="recent-h" className="display-sm">Recently viewed</h2>
          <div className="grid">
            {recent.map((rid) => {
              const p = getProduct(rid);
              return p ? <ProductCard key={p.id} product={p} /> : null;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
