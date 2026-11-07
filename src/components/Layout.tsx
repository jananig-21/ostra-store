import { Suspense, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../store/auth";
import { useCart } from "../store/cart";
import { useWishlist } from "../store/wishlist";
import { CartDrawer } from "./CartDrawer";
import { BagIcon, HeartIcon, MoonIcon, SearchIcon, SunIcon, UserIcon } from "./Icons";
import { SearchPalette } from "./SearchPalette";

export function Layout() {
  const cart = useCart();
  const wishlist = useWishlist();
  const { user } = useAuth();
  const [theme, toggleTheme] = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(cart.count);
  const location = useLocation();

  // ⌘K / Ctrl+K anywhere, or "/" when not typing, opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // animate the bag badge when something is added
  useEffect(() => {
    if (cart.count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prevCount.current = cart.count;
      return () => clearTimeout(t);
    }
    prevCount.current = cart.count;
  }, [cart.count]);

  // new page: scroll to top, unless it's only the shop filters changing
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>
        Skip to content
      </a>
      <div className="announce">Free shipping over $150 · 30-day returns · Use code <strong>WELCOME10</strong> for 10% off</div>
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="logo" aria-label="Ostra home">
            ostra<span>.</span>
          </Link>
          <nav aria-label="Main" className="nav">
            {[["Shop all", ""], ["Ceramics", "Ceramics"], ["Lighting", "Lighting"], ["Textiles", "Textiles"]].map(([label, cat]) => {
              // NavLink ignores the query string, so match the category ourselves
              const current = location.pathname === "/shop" && (new URLSearchParams(location.search).get("cat") ?? "") === cat;
              return (
                <Link key={label} to={cat ? `/shop?cat=${cat}` : "/shop"} aria-current={current ? "page" : undefined}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="header__actions">
            <button className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search products" aria-keyshortcuts="Control+K Meta+K /">
              <SearchIcon />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>
            <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
            <Link to="/account" className="icon-btn" aria-label={user ? `Account: ${user.name}` : "Sign in"}>
              <UserIcon />
            </Link>
            <Link to="/wishlist" className="icon-btn has-count" aria-label={`Wishlist, ${wishlist.ids.length} items`}>
              <HeartIcon />
              {wishlist.ids.length > 0 && <span className="count" aria-hidden="true">{wishlist.ids.length}</span>}
            </Link>
            <button className={`icon-btn has-count ${bump ? "bump" : ""}`} onClick={cart.open} aria-label={`Open bag, ${cart.count} items`}>
              <BagIcon />
              {cart.count > 0 && <span className="count" aria-hidden="true">{cart.count}</span>}
            </button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="page-loading" aria-busy="true" aria-label="Loading page" />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div>
            <p className="logo">ostra<span>.</span></p>
            <p className="muted">Objects for slower days. A demo storefront: no payments are taken and no data leaves your browser.</p>
          </div>
          <div>
            <h2 className="footer__h">Shop</h2>
            <ul>
              <li><Link to="/shop?cat=Ceramics">Ceramics</Link></li>
              <li><Link to="/shop?cat=Glass">Glass</Link></li>
              <li><Link to="/shop?cat=Lighting">Lighting</Link></li>
              <li><Link to="/shop?cat=Textiles">Textiles</Link></li>
              <li><Link to="/shop?cat=Scent">Scent</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="footer__h">Help</h2>
            <ul>
              <li><Link to="/account">Your account</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><button className="link-btn" onClick={() => setSearchOpen(true)}>Search (⌘K)</button></li>
            </ul>
          </div>
        </div>
        <p className="footer__legal muted small">© {new Date().getFullYear()} Ostra. A portfolio project by Janani Giridharan.</p>
      </footer>

      <CartDrawer />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
