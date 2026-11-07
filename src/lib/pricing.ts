export const FREE_SHIPPING_THRESHOLD = 15000; // cents
export const SHIPPING_FLAT = 1200;
export const TAX_RATE = 0.06;

export const PROMO_CODES: Record<string, { label: string; percentOff: number }> = {
  WELCOME10: { label: "10% off your first order", percentOff: 10 },
  STUDIO20: { label: "20% studio sale", percentOff: 20 },
};

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  /** cents still needed to unlock free shipping (0 once unlocked) */
  toFreeShipping: number;
}

/** All amounts are integer cents; rounding happens once per line so totals always add up. */
export function computeTotals(subtotal: number, promoCode?: string | null): Totals {
  const promo = promoCode ? PROMO_CODES[promoCode] : undefined;
  const discount = promo ? Math.round((subtotal * promo.percentOff) / 100) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = subtotal === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = Math.round(afterDiscount * TAX_RATE);
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: afterDiscount + shipping + tax,
    toFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount),
  };
}
