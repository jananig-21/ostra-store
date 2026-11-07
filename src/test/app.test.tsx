import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Providers, routes } from "../App";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}

describe("storefront", () => {
  it("filters the shop from the search box and keeps the query in the URL", async () => {
    const user = userEvent.setup();
    const router = renderAt("/shop");
    await screen.findByRole("heading", { name: "The collection" });
    await user.type(screen.getByLabelText("Search products", { selector: "input" }), "linen");
    await waitFor(() => expect(router.state.location.search).toBe("?q=linen"));
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(expect.arrayContaining(["Field Linen Throw", "Drift Cushion Cover", "Lantern Table Lamp"]));
    expect(titles).not.toContain("Dune Mug");
  });

  it("shows an empty state and resets filters", async () => {
    const user = userEvent.setup();
    renderAt("/shop?q=zzzz");
    await screen.findByText("Nothing matches those filters.");
    await user.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(await screen.findByText("16 products")).toBeInTheDocument();
  });

  it("adds a chosen colour and size to the bag and computes totals", async () => {
    const user = userEvent.setup();
    renderAt("/product/tide-vase");
    await screen.findByRole("heading", { level: 1, name: "Tide Vase" });
    // product cards further down the page have their own colour radios, so scope to the main options
    await user.click(within(screen.getByRole("group", { name: /^Colour:/ })).getByRole("radio", { name: "Ink" }));
    await user.click(within(screen.getByRole("group", { name: /^Size:/ })).getByRole("radio", { name: "Large" }));
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: /Add to bag/ }));

    const bag = await screen.findByRole("dialog", { name: /Your bag/ });
    expect(within(bag).getByText("Ink · Large")).toBeInTheDocument();
    // 2 × $68 = $136 → $12 shipping, 6% tax $8.16 → $156.16
    expect(within(bag).getByText("$156.16")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open bag, 2 items" })).toBeInTheDocument();
  });

  it("removes an item and brings it back with Undo", async () => {
    const user = userEvent.setup();
    renderAt("/product/dune-mug");
    await user.click(await screen.findByRole("button", { name: /Add to bag/ }));
    const bag = await screen.findByRole("dialog", { name: /Your bag/ });
    await user.click(within(bag).getByRole("button", { name: "Remove" }));
    expect(await within(bag).findByText("Your bag is empty.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(await within(bag).findByText("Dune Mug")).toBeInTheDocument();
  });

  it("validates checkout and places an order", async () => {
    const user = userEvent.setup();
    const router = renderAt("/product/field-throw");
    await user.click(await screen.findByRole("button", { name: /Add to bag/ }));
    await user.click(await screen.findByRole("button", { name: /^Checkout/ }));
    await screen.findByRole("heading", { name: "Checkout" });

    await user.click(screen.getByRole("button", { name: "Continue to review" }));
    expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Full name")).toHaveFocus();

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Street address"), "500 S State St");
    await user.type(screen.getByLabelText("City"), "Ann Arbor");
    await user.type(screen.getByLabelText("State"), "MI");
    await user.type(screen.getByLabelText("ZIP code"), "48109");
    await user.click(screen.getByRole("button", { name: "Continue to review" }));
    await user.click(await screen.findByRole("button", { name: /Place order/ }));

    expect(await screen.findByRole("heading", { name: "Thank you, Ada." }, { timeout: 3000 })).toBeInTheDocument();
    expect(router.state.location.pathname).toMatch(/^\/order\/OST-/);
    expect(screen.getByRole("button", { name: "Open bag, 0 items" })).toBeInTheDocument();
  });

  it("creates an account, signs out and rejects a wrong password", async () => {
    const user = userEvent.setup();
    renderAt("/account");
    await user.click(await screen.findByRole("tab", { name: "Create account" }));
    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "analytical1");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await screen.findByRole("heading", { name: "Hello, Ada" });

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await user.type(await screen.findByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpass1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("don't match");
  });

  it("opens search with Ctrl+K and navigates with the keyboard", async () => {
    const user = userEvent.setup();
    const router = renderAt("/");
    await screen.findByRole("heading", { level: 1 });
    await user.keyboard("{Control>}k{/Control}");
    const box = await screen.findByRole("combobox");
    expect(box).toHaveFocus();
    await user.type(box, "ember");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(router.state.location.pathname).toBe("/product/ember-candle"));
  });
});
