import { memo, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { useCart } from "../store/cart";
import { useToast } from "../store/toast";
import { useWishlist } from "../store/wishlist";
import { Price, Stars } from "./Bits";
import { HeartIcon } from "./Icons";
import { ProductArt } from "./ProductArt";

export const ProductCard = memo(function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const [colorIdx, setColorIdx] = useState(0);
  const { add, open } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const color = product.colors[colorIdx] ?? product.colors[0]!;
  const saved = wishlist.has(product.id);
  const soldOut = product.stock === 0;

  return (
    <article className="card" data-priority={priority || undefined}>
      <div className="card__media">
        <Link to={`/product/${product.id}?color=${encodeURIComponent(color.name)}`} className="card__link" aria-label={`${product.name}, ${color.name}`}>
          <ProductArt shape={product.shape} color={color.hex} label={`${product.name} in ${color.name}`} className="card__art" />
        </Link>
        <div className="card__badges">
          {product.isNew && <span className="badge">New</span>}
          {product.compareAt && <span className="badge badge--sale">Sale</span>}
          {soldOut && <span className="badge badge--muted">Sold out</span>}
        </div>
        <button
          className={`card__fav ${saved ? "is-on" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          onClick={() => {
            const added = wishlist.toggle(product.id);
            toast({ message: added ? `Saved ${product.name}` : `Removed ${product.name} from wishlist` });
          }}
        >
          <HeartIcon filled={saved} />
        </button>
        {!soldOut && (
          <button
            className="card__quick"
            onClick={() => {
              add(product.id, color.name, product.sizes?.[0]);
              toast({ message: `${product.name} (${color.name}) added to bag`, action: { label: "View bag", onClick: open } });
            }}
          >
            Quick add
          </button>
        )}
      </div>
      <div className="card__body">
        <div className="card__row">
          <h3 className="card__title">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <Price price={product.price} compareAt={product.compareAt} />
        </div>
        <div className="card__row">
          <div className="swatches" role="radiogroup" aria-label={`${product.name} colour`}>
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                role="radio"
                aria-checked={i === colorIdx}
                aria-label={c.name}
                title={c.name}
                className="swatch"
                style={{ background: c.hex }}
                onClick={() => setColorIdx(i)}
              />
            ))}
          </div>
          <Stars rating={product.rating} reviews={product.reviews} />
        </div>
      </div>
    </article>
  );
});
