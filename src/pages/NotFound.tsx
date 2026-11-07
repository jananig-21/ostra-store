import { Link } from "react-router-dom";
import { ProductArt } from "../components/ProductArt";

export default function NotFound() {
  return (
    <div className="narrow empty">
      <div className="notfound__art" aria-hidden="true">
        <ProductArt shape="bowl" color="#a9bcc9" label="" variant="plain" />
      </div>
      <h1 className="display-sm">We couldn't find that page.</h1>
      <p className="muted">It may have sold out, or the link may be wrong.</p>
      <Link to="/shop" className="btn btn--primary">Back to the shop</Link>
    </div>
  );
}
