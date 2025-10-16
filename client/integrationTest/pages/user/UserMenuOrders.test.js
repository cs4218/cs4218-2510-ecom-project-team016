import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Orders from "client/src/pages/user/Orders";
import { useAuth } from "client/src/context/auth";
import axios from "axios";

jest.mock("axios");

jest.mock('client/src/context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("client/src/context/cart", () => ({
    useCart: () => [[], jest.fn()],
}));

jest.mock("client/src/context/search", () => ({
    useSearch: () => [{}, jest.fn()],
}));

describe("Orders Integration with UserMenu", () => {
    it("renders orders and menu", async () => {
        useAuth.mockReturnValue([{ token: "fake-token" }]);

        const fakeOrders = [
            {
                _id: "1",
                status: "Pending",
                buyer: { name: "Alice" },
                createAt: new Date(),
                payment: { success: true },
                products: [
                    { _id: "p1", name: "Product 1", description: "Desc 1", price: 100 },
                ],
            },
        ];

        axios.get.mockResolvedValue({ data: fakeOrders });

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );
        // Check UserMenu links
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();

        // Wait for orders to render
        await waitFor(() => {
            expect(screen.getByText("Pending")).toBeInTheDocument();
            expect(screen.getByText("Alice")).toBeInTheDocument();
            expect(screen.getByText("Product 1")).toBeInTheDocument();
        });
    });

    it("renders 'No orders found' when orders list is empty", async () => {
        axios.get.mockResolvedValueOnce({ data: { orders: [] } });

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );

        expect(await screen.findByText("No orders found")).toBeInTheDocument();
    });

    it("shows 'Pending' if order status is missing", async () => {
        axios.get.mockResolvedValueOnce({
            data: { orders: [{ _id: 1, status: null, products: [] }] },
        });

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );

        expect(await screen.findByText("Pending")).toBeInTheDocument();
    });

});
