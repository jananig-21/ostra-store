import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../lib/pricing";
import { save } from "../lib/storage";
import { validateShipping, type Errors, type ShippingForm } from "../lib/validation";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuth, type Order } from "../store/auth";
import { useCart } from "../store/cart";
import { ProductArt } from "../components/ProductArt";
import { CheckIcon } from "../components/Icons";

export const LAST_ORDER_KEY = "ostra.lastOrder.v1";

const FIELDS: { name: keyof ShippingForm; label: string; autoComplete: string; half?: boolean; inputMode?: "numeric" | "email" }[] = [
  { name: "fullName", label: "Full name", autoComplete: "name" },
  { name: "email", label: "Email", autoComplete: "email", inputMode: "email" },
  { name: "address", label: "Street address", autoComplete: "street-address" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1", half: true },
  { name: "zip", label: "ZIP code", autoComplete: "postal-code", half: true, inputMode: "numeric" },
];

export default function Checkout() {
  useDocumentTitle("Checkout");
  const cart = useCart();
  const { user, recordOrder } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<ShippingForm>({ fullName: user?.name ?? "", email: user?.email ?? "", address: "", city: "", state: "", zip: "" });
  const [errors, setErrors] = useState<Errors<ShippingForm>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingForm, boolean>>>({});
  const [placing, setPlacing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (cart.lines.length === 0 && !placing) {
    return (
      <div className="narrow empty">
        <h1 className="display-sm">Your bag is empty</h1>
        <p className="muted">Add something you love, then come back to check out.</p>
        <Link to="/shop" className="btn btn--primary">Browse the shop</Link>
      </div>
    );
  }

  const set = (name: keyof ShippingForm, value: string) => {
    const next = { ...form, [name]: value };
    setForm(next);
    // validate as you type only after a field has been visited, so errors don't shout at the start
    if (touched[name]) setErrors(validateShipping(next));
  };

  const continueToReview = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateShipping(form);
    setErrors(errs);
    setTouched(Object.fromEntries(FIELDS.map((f) => [f.name, true])));
    const firstBad = FIELDS.find((f) => errs[f.name]);
    if (firstBad) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstBad.name}"]`)?.focus();
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 900)); // stands in for a payment API round-trip
    const order: Order = {
      id: "OST-" + Date.now().toString(36).toUpperCase().slice(-6),
      placedAt: new Date().toISOString(),
      items: cart.lines.map((l) => ({ productId: l.productId, name: l.product.name, color: l.color, size: l.size, qty: l.qty, price: l.product.price })),
      totals: cart.totals,
      shipping: { ...form, state: form.state.toUpperCase() },
      promo: cart.promo,
    };
    save(LAST_ORDER_KEY, order);
    recordOrder(order);
    cart.clear();
    navigate(`/order/${order.id}`, { replace: true, state: order });
  };

  const { totals } = cart;

  return (
    <div className="checkout">
      <h1 className="display-sm">Checkout</h1>
      <ol className="steps" aria-label="Checkout progress">
        <li className={step === 1 ? "is-current" : "is-done"} aria-current={step === 1 ? "step" : undefined}>
          <span>{step > 1 ? <CheckIcon width={14} height={14} /> : 1}</span> Shipping
        </li>
        <li className={step === 2 ? "is-current" : ""} aria-current={step === 2 ? "step" : undefined}>
          <span>2</span> Review and place order
        </li>
      </ol>

      <div className="checkout__grid">
        <div>
          {step === 1 ? (
            <form ref={formRef} className="form" onSubmit={continueToReview} noValidate>
              <p className="muted small">
                {user ? <>Signed in as {user.email}. This order will appear in your account.</> : <>Checking out as a guest. <Link to="/account">Sign in</Link> to save your order history.</>}
              </p>
              <div className="form__grid">
                {FIELDS.map((f) => {
                  const err = touched[f.name] ? errors[f.name] : undefined;
                  return (
                    <div key={f.name} className={`field ${f.half ? "field--half" : ""}`}>
                      <label htmlFor={f.name}>{f.label}</label>
                      <input
                        id={f.name}
                        name={f.name}
                        autoComplete={f.autoComplete}
                        inputMode={f.inputMode}
                        value={form[f.name]}
                        onChange={(e) => set(f.name, e.target.value)}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, [f.name]: true }));
                          setErrors(validateShipping(form));
                        }}
                        aria-invalid={!!err}
                        aria-describedby={err ? `${f.name}-err` : undefined}
                      />
                      {err && <p id={`${f.name}-err`} className="field-error">{err}</p>}
                    </div>
                  );
                })}
              </div>
              <button className="btn btn--primary btn--block" type="submit">
                Continue to review
              </button>
            </form>
          ) : (
            <div className="review">
              <section className="review__block">
                <div className="review__head">
                  <h2>Ship to</h2>
                  <button className="link-btn" onClick={() => setStep(1)}>Edit</button>
                </div>
                <p>
                  {form.fullName}<br />
                  {form.address}<br />
                  {form.city}, {form.state.toUpperCase()} {form.zip}<br />
                  <span className="muted">{form.email}</span>
                </p>
              </section>
              <section className="review__block">
                <h2>Payment</h2>
                <p className="muted">This is a demo store: no card is needed and nothing is charged.</p>
              </section>
              <button className="btn btn--primary btn--block" onClick={placeOrder} disabled={placing} aria-busy={placing}>
                {placing ? <span className="spinner" aria-hidden="true" /> : null}
                {placing ? "Placing order…" : `Place order · ${formatPrice(totals.total)}`}
              </button>
            </div>
          )}
        </div>

        <aside className="summary" aria-labelledby="sum-h">
          <h2 id="sum-h">Order summary</h2>
          <ul className="summary__lines">
            {cart.lines.map((l) => (
              <li key={l.key}>
                <span className="summary__thumb">
                  <ProductArt shape={l.product.shape} color={l.product.colors.find((c) => c.name === l.color)?.hex ?? "#ccc"} label="" />
                  <span className="summary__qty" aria-label={`quantity ${l.qty}`}>{l.qty}</span>
                </span>
                <span className="summary__name">
                  {l.product.name}
                  <small className="muted">{l.color}{l.size && ` · ${l.size}`}</small>
                </span>
                <span>{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="totals">
            <div><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div className="totals__discount"><dt>Discount ({cart.promo})</dt><dd>−{formatPrice(totals.discount)}</dd></div>}
            <div><dt>Shipping</dt><dd>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd></div>
            <div><dt>Estimated tax</dt><dd>{formatPrice(totals.tax)}</dd></div>
            <div className="totals__grand"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
