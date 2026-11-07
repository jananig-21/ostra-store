import { lazy, type ReactNode } from "react";
import { createHashRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import RouteError from "./pages/RouteError";
import { AuthProvider } from "./store/auth";
import { CartProvider } from "./store/cart";
import { ToastProvider } from "./store/toast";
import { WishlistProvider } from "./store/wishlist";

// every route except the landing page is code-split, so first load ships only what Home needs
const Shop = lazy(() => import("./pages/Shop"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Account = lazy(() => import("./pages/Account"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const NotFound = lazy(() => import("./pages/NotFound"));

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/shop", element: <Shop /> },
      { path: "/product/:id", element: <ProductPage /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/order/:id", element: <OrderConfirmation /> },
      { path: "/account", element: <Account /> },
      { path: "/wishlist", element: <Wishlist /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

// hash routing: GitHub Pages serves static files only, so deep links must not need server rewrites
const router = createHashRouter(routes);

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
