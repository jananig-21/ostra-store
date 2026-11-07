export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP = /^\d{5}(-\d{4})?$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Enter your email address.";
  if (!EMAIL.test(email.trim())) return "Enter an email like name@example.com.";
  return undefined;
}

export function validatePassword(pw: string): string | undefined {
  if (pw.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Use at least one letter and one number.";
  return undefined;
}

export interface ShippingForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export function validateShipping(f: ShippingForm): Errors<ShippingForm> {
  const e: Errors<ShippingForm> = {};
  if (f.fullName.trim().length < 2) e.fullName = "Enter your full name.";
  const email = validateEmail(f.email);
  if (email) e.email = email;
  if (f.address.trim().length < 5) e.address = "Enter a street address.";
  if (!f.city.trim()) e.city = "Enter a city.";
  if (!/^[A-Z]{2}$/.test(f.state.trim().toUpperCase())) e.state = "Use a 2-letter state code.";
  if (!ZIP.test(f.zip.trim())) e.zip = "Enter a 5-digit ZIP code.";
  return e;
}
