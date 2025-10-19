import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "../../src/context/cart";

function Consumer() {
  const [cart, setCart] = useCart();
  return (
    <button onClick={() => setCart([...cart, { id: cart.length + 1 }])}>
      count:{cart.length}
    </button>
  );
}

describe("Cart context", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("loads from localStorage if present", () => {
    window.localStorage.setItem("cart", JSON.stringify([{ id: 1 }]));
  render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    );
  expect(screen.getByText(/count:1/)).toBeInTheDocument();
  });

  test("updates cart via setter", async () => {
  render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    );
  const btn = screen.getByText((content, element) => element.tagName.toLowerCase() === 'button' && content.includes('count:'));
  await userEvent.click(btn);
  expect(screen.getByText(/count:\s*1/i)).toBeInTheDocument();
  });
});
