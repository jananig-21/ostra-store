import { Link } from "react-router-dom";
import { categories, products } from "../data/products";
import { ProductArt } from "../components/ProductArt";
import { ProductCard } from "../components/ProductCard";
import { ArrowIcon } from "../components/Icons";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const CATEGORY_ART = {
  Ceramics: { shape: "vase", color: "#c0714f" },
  Glass: { shape: "carafe", color: "#a9bcc9" },
  Lighting: { shape: "lamp", color: "#d4a24c" },
  Textiles: { shape: "throw", color: "#9caf88" },
  Scent: { shape: "candle", color: "#2d3142" },
} as const;

export default function Home() {
  useDocumentTitle();
  const newArrivals = products.filter((p) => p.isNew);
  const avgRating = products.reduce((s, p) => s + p.rating, 0) / products.length;
  const bestsellers =[...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Autumn collection · 2026</p>
          <h1 className="display">
            Objects for <em>slower</em> days.
          </h1>
          <p className="lede">Stoneware, linen and warm light, made in small batches by independent studios and built to be used every day.</p>
          <div className="hero__cta">
            <Link to="/shop" className="btn btn--primary">
              Shop the collection <ArrowIcon width={18} height={18} />
            </Link>
            <Link to="/shop?sort=new" className="btn btn--ghost">
              What's new
            </Link>
          </div>
          <dl className="hero__stats">
            <div><dt>Pieces</dt><dd>{products.length}</dd></div>
            <div><dt>Avg. rating</dt><dd>{avgRating.toFixed(1)}★</dd></div>
            <div><dt>Returns</dt><dd>30 days</dd></div>
          </dl>
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="hero__blob" />
          <ProductArt shape="vase" color="#c0714f" label="" variant="plain" className="hero__piece hero__piece--a" />
          <ProductArt shape="bud" color="#e9e1d3" label="" variant="plain" className="hero__piece hero__piece--b" />
          <ProductArt shape="candle" color="#2d3142" label="" variant="plain" className="hero__piece hero__piece--c" />
        </div>
      </section>

      <section className="section" aria-labelledby="cat-h">
        <div className="section__head">
          <h2 id="cat-h" className="display-sm">Shop by room and ritual</h2>
        </div>
        <ul className="cats">
          {categories.map((c) => (
            <li key={c}>
              <Link to={`/shop?cat=${c}`} className="cat">
                <ProductArt shape={CATEGORY_ART[c].shape} color={CATEGORY_ART[c].color} label="" className="cat__art" />
                <span className="cat__label">
                  {c} <ArrowIcon width={16} height={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="new-h">
        <div className="section__head">
          <h2 id="new-h" className="display-sm">New this season</h2>
          <Link to="/shop?sort=new" className="link-arrow">
            View all <ArrowIcon width={16} height={16} />
          </Link>
        </div>
        <div className="grid">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 2} />
          ))}
        </div>
      </section>

      <section className="values" aria-label="Why Ostra">
        {[
          ["Made in small batches", "Every piece comes from a studio of fewer than 20 people."],
          ["Free shipping over $150", "Carbon-neutral delivery in plastic-free packaging."],
          ["30-day returns", "If it doesn't feel right at home, send it back."],
        ].map(([title, body]) => (
          <div key={title} className="value">
            <h3>{title}</h3>
            <p className="muted">{body}</p>
          </div>
        ))}
      </section>

      <section className="section" aria-labelledby="best-h">
        <div className="section__head">
          <h2 id="best-h" className="display-sm">Most loved</h2>
          <Link to="/shop?sort=rating" className="link-arrow">
            Top rated <ArrowIcon width={16} height={16} />
          </Link>
        </div>
        <div className="grid">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
