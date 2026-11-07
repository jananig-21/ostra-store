import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../lib/pricing";
import { validateEmail, validatePassword } from "../lib/validation";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

export default function Account() {
  const { user, signOut } = useAuth();
  useDocumentTitle(user ? "Your account" : "Sign in");
  if (!user) return <AuthForms />;

  return (
    <div className="narrow account">
      <div className="account__head">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="display-sm">Hello, {user.name.split(" ")[0]}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <button className="btn btn--ghost" onClick={signOut}>Sign out</button>
      </div>
      <h2 className="h3">Order history</h2>
      {user.orders.length === 0 ? (
        <div className="empty empty--inline">
          <p className="muted">No orders yet.</p>
          <Link to="/shop" className="btn btn--primary">Start shopping</Link>
        </div>
      ) : (
        <ul className="orders">
          {user.orders.map((o) => (
            <li key={o.id} className="order">
              <div className="order__head">
                <Link to={`/order/${o.id}`} className="order__id">{o.id}</Link>
                <span className="muted small">{new Date(o.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span className="order__total">{formatPrice(o.totals.total)}</span>
              </div>
              <p className="muted small">{o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AuthForms() {
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = {
      name: mode === "signup" && name.trim().length < 2 ? "Enter your name." : undefined,
      email: validateEmail(email),
      password: mode === "signup" ? validatePassword(password) : password ? undefined : "Enter your password.",
    };
    setErrors(errs);
    if (errs.name || errs.email || errs.password) return;
    setBusy(true);
    const failure = mode === "signup" ? await signUp(name, email, password) : await signIn(email, password);
    setBusy(false);
    if (failure) setErrors({ form: failure });
    else toast({ message: mode === "signup" ? "Account created. Welcome to Ostra." : "Signed in." });
  };

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    setErrors({});
  };

  return (
    <div className="narrow auth">
      <div className="tabs" role="tablist" aria-label="Account">
        <button role="tab" aria-selected={mode === "signin"} onClick={() => switchMode("signin")}>Sign in</button>
        <button role="tab" aria-selected={mode === "signup"} onClick={() => switchMode("signup")}>Create account</button>
      </div>
      <form className="form" onSubmit={submit} noValidate aria-describedby="auth-note">
        <h1 className="display-sm">{mode === "signin" ? "Welcome back" : "Join Ostra"}</h1>
        <p id="auth-note" className="muted small">
          Demo accounts stay in this browser only. Passwords are hashed with PBKDF2 before being stored. Please don't reuse a real password.
        </p>
        {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
        {mode === "signup" && (
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
            {errors.name && <p id="name-err" className="field-error">{errors.name}</p>}
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
          {errors.email && <p id="email-err" className="field-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="pw">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-err" : mode === "signup" ? "password-hint" : undefined}
            />
            <button type="button" className="link-btn" onClick={() => setShowPw((s) => !s)} aria-pressed={showPw}>
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password ? (
            <p id="password-err" className="field-error">{errors.password}</p>
          ) : (
            mode === "signup" && <p id="password-hint" className="muted small">At least 8 characters, with a letter and a number.</p>
          )}
        </div>
        <button className="btn btn--primary btn--block" type="submit" disabled={busy} aria-busy={busy}>
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
