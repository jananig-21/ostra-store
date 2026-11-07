import { Link } from "react-router-dom";
import { getProduct } from "../data/products";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useWishlist } from "../store/wishlist";
import { ProductCard } from "../components/ProductCard";

export default function Wishlist() {
  useDocumentTitle("Wishlist");
  const { ids } = useWishlist();
  const items = ids.map(getProduct).filter((p) => p !== undefined);

  return (
    <div className="shop">
      <header className="shop__head">
        <h1 className="display-sm">Wishlist</h1>
        <p className="muted">{items.length} saved</p>
      </header>
      {items.length === 0 ? (
        <div className="empty">
          <p className="display-sm">Nothing saved yet.</p>
          <p className="muted">Tap the heart on anything you like and it will wait for you here.</p>
          <Link to="/shop" className="btn btn--primary">Browse the shop</Link>
        </div>
      ) : (
        <div className="grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
