import { MAX_PER_LINE } from "../store/cart";
import { formatPrice } from "../lib/pricing";
import { StarIcon } from "./Icons";

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="stars" aria-label={`Rated ${rating} out of 5${reviews !== undefined ? `, ${reviews} reviews` : ""}`}>
      <span aria-hidden="true" className="stars__icons">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} width={14} height={14} amount={Math.max(0, Math.min(1, rating - i))} />
        ))}
      </span>
      {reviews !== undefined && <span aria-hidden="true" className="stars__count">({reviews})</span>}
    </span>
  );
}

export function Price({ price, compareAt }: { price: number; compareAt?: number }) {
  return (
    <span className="price">
      {compareAt ? (
        <>
          <span className="price__now price__now--sale">{formatPrice(price)}</span>{" "}
          <s className="price__was" aria-label={`was ${formatPrice(compareAt)}`}>{formatPrice(compareAt)}</s>
        </>
      ) : (
        <span className="price__now">{formatPrice(price)}</span>
      )}
    </span>
  );
}

export function QuantityStepper({ value, onChange, max = MAX_PER_LINE, label }: { value: number; onChange: (n: number) => void; max?: number; label: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)} disabled={value <= 0}>
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)} disabled={value >= max}>
        +
      </button>
    </div>
  );
}

export function StockNote({ stock }: { stock: number }) {
  if (stock === 0) return <span className="stock stock--out">Sold out</span>;
  if (stock <= 5) return <span className="stock stock--low">Only {stock} left</span>;
  return <span className="stock">In stock</span>;
}
