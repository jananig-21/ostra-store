import { Link, useLocation, useParams } from "react-router-dom";
import { formatPrice } from "../lib/pricing";
import { load } from "../lib/storage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { Order } from "../store/auth";
import { useAuth } from "../store/auth";
import { CheckIcon } from "../components/Icons";
import { LAST_ORDER_KEY } from "./Checkout";
import NotFound from "./NotFound";

const isOrder = (v: unknown): v is Order => typeof v === "object" && v !== null && "id" in v && "items" in v;

export default function OrderConfirmation() {
  useDocumentTitle("Order confirmed");
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  // navigation state first; fall back to storage so a refresh still shows the order
  const order = [state, load<Order | null>(LAST_ORDER_KEY, null, (v): v is Order | null => v === null || isOrder(v)), ...(user?.orders ?? [])].find(
    (o): o is Order => isOrder(o) && o.id === id,
  );
  if (!order) return <NotFound />;

  const arrival = new Date(order.placedAt);
  arrival.setDate(arrival.getDate() + 5);

  return (
    <div className="narrow confirm">
      <div className="confirm__badge" aria-hidden="true">
        <CheckIcon width={32} height={32} />
      </div>
      <h1 className="display-sm">Thank you, {order.shipping.fullName.split(" ")[0]}.</h1>
      <p className="lede">
        Order <strong>{order.id}</strong> is confirmed. A (pretend) receipt is on its way to {order.shipping.email}.
      </p>
      <p className="muted">Estimated arrival: {arrival.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      <ul className="confirm__items">
        {order.items.map((i) => (
          <li key={`${i.productId}-${i.color}-${i.size}`}>
            <span>
              {i.qty} × {i.name} <span className="muted">({i.color}{i.size && `, ${i.size}`})</span>
            </span>
            <span>{formatPrice(i.price * i.qty)}</span>
          </li>
        ))}
        <li className="confirm__total">
          <span>Total paid</span>
          <span>{formatPrice(order.totals.total)}</span>
        </li>
      </ul>
      <div className="hero__cta">
        <Link to="/shop" className="btn btn--primary">Keep shopping</Link>
        {user && <Link to="/account" className="btn btn--ghost">View order history</Link>}
      </div>
    </div>
  );
}
