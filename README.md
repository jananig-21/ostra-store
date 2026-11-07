# Ostra: an e-commerce storefront in React + TypeScript

**Live site:** https://jananig-21.github.io/ostra-store/

Ostra is a fictional home-goods store built as a frontend portfolio project. It covers the whole shopping flow, from browsing and search to cart, checkout and accounts. It is written in strict TypeScript with no UI library, and it is accessible from the keyboard and to screen readers.

> Demo store: no payments are taken, and accounts and orders live only in your browser's `localStorage`.

## Features

- **Catalogue and search.** The shop page has category, colour, price and stock filters and five sort orders, all stored in the URL so any filtered view can be shared or bookmarked. Search is debounced and ignores case and accents.
- **Command-palette search.** Press ⌘K, Ctrl+K or `/` on any page. It follows the ARIA combobox/listbox pattern with arrow-key navigation.
- **Product pages.** Colour and size variants, with the colour stored in the URL; a quantity stepper limited by stock; related and recently viewed products.
- **Cart drawer.** A focus-trapped dialog with a quantity stepper, **Undo** for removed items, a free-shipping progress bar, promo codes (`WELCOME10`, `STUDIO20`) and live totals. The cart persists across reloads and stays in sync across open tabs.
- **Checkout.** Two steps: shipping, then review. Fields are validated on blur and on submit, and focus moves to the first invalid field. An order confirmation page follows.
- **Accounts.** Sign up, sign in and order history. Passwords are hashed with PBKDF2 (Web Crypto, 100k iterations, random salt) and compared in constant time.
- **Wishlist**, **dark mode** (follows the system setting, can be toggled, and avoids a flash on load) and **toast notifications** that pause on hover or focus.
- **Product imagery drawn in SVG** from each product's colour. Every colourway renders instantly, stays sharp at any size and costs no image requests.

## Engineering

| Area | What's done |
|---|---|
| State | `useReducer` cart with a pure, unit-tested reducer; React context per domain (cart, wishlist, auth, toasts); validated `localStorage` persistence that never throws |
| Money | All prices are integer cents, so totals never drift. Discount is applied before shipping and tax |
| Performance | Every route except Home is code-split with `React.lazy`, so the first load ships only the home page. Product art is inline SVG, so the catalogue makes no image requests |
| Resilience | After a redeploy, an open tab that requests a stale code-split chunk reloads itself once instead of crashing |
| Accessibility | Skip link, landmarks, labelled dialogs with focus trap and focus return, `aria-live` regions for cart count, results and toasts, real radio/checkbox inputs for options, visible focus styles, `prefers-reduced-motion` support |
| Responsive | Desktop sidebar filters become a bottom sheet on mobile; the layout holds at 375 px without horizontal scroll |
| Testing | 24 tests with Vitest + Testing Library: reducer, pricing, filters and URL round-trip, validation, password hashing, and full user flows (search, add to bag, undo, checkout, sign-up/sign-in, keyboard search) |
| CI/CD | GitHub Actions runs the type check, tests and build on every push, then deploys to GitHub Pages |

## Stack

React 18 · TypeScript (strict) · React Router 6 · Vite 5 · Vitest · Testing Library · plain CSS with custom-property design tokens · GitHub Actions · GitHub Pages

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 24 tests
npm run build      # type check + production build
```

## Project structure

```
src/
  data/products.ts        catalogue
  lib/                    pricing, filters, validation, crypto, storage (pure, unit-tested)
  store/                  cart reducer + contexts for cart, wishlist, auth, toasts
  hooks/                  focus trap, debounce, theme, document title
  components/             layout, cart drawer, search palette, product card, SVG product art
  pages/                  home, shop, product, checkout, confirmation, account, wishlist
  test/                   unit + integration tests
```
