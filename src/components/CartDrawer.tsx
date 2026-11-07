import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FREE_SHIPPING_THRESHOLD, PROMO_CODES, formatPrice } from "../lib/pricing";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useCart } from "../store/cart";
import { useToast } from "../store/toast";
import { QuantityStepper } from "./Bits";
import { CloseIcon } from "./Icons";
import { ProductArt } from "./ProductArt";

export function CartDrawer() {
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const panel = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  useFocusTrap(panel, cart.isOpen, cart.close);
  // a closed drawer stays in the DOM (for its slide animation) but must not be focusable
  useEffect(() => {
    if (panel.current) panel.current.inert = !cart.isOpen;
  }, [cart.isOpen]);

  const { totals } = cart;
  const progress = Math.min(1, (totals.subtotal - totals.discount) / FREE_SHIPPING_THRESHOLD);

  const removeLine = (key: string, name: string) => {
    const removed = cart.remove(key);
    if (removed) toast({ message: `Removed ${name}`, action: { label: "Undo", onClick: () => cart.restore(removed.line, removed.index) } });
  };

  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    if (cart.applyPromo(code)) {
      setCode("");
      setCodeError(null);
    } else {
      setCodeError("That code isn't valid. Try WELCOME10.");
    }
  };

  return (
    <div className={`drawer ${cart.isOpen ? "is-open" : ""}`} aria-hidden={!cart.isOpen}>
      <div className="drawer__scrim" onClick={cart.close} />
      <div ref={panel} className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabIndex={-1}>
        <header className="drawer__head">
          <h2 id="cart-title">Your bag {cart.count > 0 && <span className="muted">({cart.count})</span>}</h2>
          <button className="icon-btn" aria-label="Close bag" onClick={cart.close}>
            <CloseIcon />
          </button>
        </header>

        {cart.lines.length === 0 ? (
          <div className="drawer__empty">
            <p className="display-sm">Your bag is empty.</p>
            <p className="muted">Start with something small: a mug, a candle, a single stem.</p>
            <Link className="btn btn--primary" to="/shop" onClick={cart.close}>
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="ship-meter" aria-live="polite">
              <p>{totals.toFreeShipping > 0 ? <>You're <strong>{formatPrice(totals.toFreeShipping)}</strong> away from free shipping</> : <>You've unlocked <strong>free shipping</strong></>}</p>
              <div className="ship-meter__track" role="progressbar" aria-label="Progress to free shipping" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
                <span style={{ transform: `scaleX(${progress})` }} />
              </div>
            </div>

            <ul className="lines">
              {cart.lines.map((l) => {
                const hex = l.product.colors.find((c) => c.name === l.color)?.hex ?? l.product.colors[0]!.hex;
                return (
                  <li key={l.key} className="line">
                    <Link to={`/product/${l.product.id}?color=${encodeURIComponent(l.color)}`} onClick={cart.close} className="line__thumb" tabIndex={-1}>
                      <ProductArt shape={l.product.shape} color={hex} label="" />
                    </Link>
                    <div className="line__info">
                      <div className="line__top">
                        <Link to={`/product/${l.product.id}?color=${encodeURIComponent(l.color)}`} onClick={cart.close} className="line__name">
                          {l.product.name}
                        </Link>
                        <span>{formatPrice(l.lineTotal)}</span>
                      </div>
                      <p className="muted small">
                        {l.color}
                        {l.size && ` · ${l.size}`}
                      </p>
                      <div className="line__actions">
                        <QuantityStepper
                          label={`Quantity of ${l.product.name}`}
                          value={l.qty}
                          max={Math.min(10, l.product.stock)}
                          onChange={(n) => (n <= 0 ? removeLine(l.key, l.product.name) : cart.setQty(l.key, n))}
                        />
                        <button className="link-btn" onClick={() => removeLine(l.key, l.product.name)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="drawer__foot">
              {cart.promo ? (
                <p className="promo-applied">
                  <span>
                    <strong>{cart.promo}</strong> · {PROMO_CODES[cart.promo]?.label}
                  </span>
                  <button className="link-btn" onClick={cart.removePromo}>
                    Remove
                  </button>
                </p>
              ) : (
                <form className="promo" onSubmit={submitCode} noValidate>
                  <label htmlFor="promo" className="sr-only">
                    Promo code
                  </label>
                  <input id="promo" placeholder="Promo code" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!codeError} aria-describedby={codeError ? "promo-err" : undefined} />
                  <button className="btn btn--ghost" type="submit">
                    Apply
                  </button>
                  {codeError && (
                    <p id="promo-err" className="field-error" role="alert">
                      {codeError}
                    </p>
                  )}
                </form>
              )}
              <dl className="totals">
                <div><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
                {totals.discount > 0 && <div className="totals__discount"><dt>Discount</dt><dd>−{formatPrice(totals.discount)}</dd></div>}
                <div><dt>Shipping</dt><dd>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd></div>
                <div><dt>Estimated tax</dt><dd>{formatPrice(totals.tax)}</dd></div>
                <div className="totals__grand"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
              </dl>
              <button
                className="btn btn--primary btn--block"
                onClick={() => {
                  cart.close();
                  navigate("/checkout");
                }}
              >
                Checkout · {formatPrice(totals.total)}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
