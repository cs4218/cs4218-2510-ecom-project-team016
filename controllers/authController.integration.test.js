import mongoose from "mongoose";
import express from "express";
import request from "supertest";
import dotenv from "dotenv";

import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

import {
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController,
    getAllUsersController,
} from "./authController.js";

dotenv.config();

describe("User & Order Integration Tests (No Middleware)", () => {
    let app;
    let user;
    let testCategory;
    let testProduct;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI_TEST);
        app = express();
        app.use(express.json());

        // Check if admin already exists
        user = await userModel.findOne({ email: "john@example.com", role: 1 });

        // Create admin if not exists
        if (!user) {
            user = await userModel.create({
                name: "John Doe",
                email: "john@example.com",
                password: "123456",
                address: "Old Address",
                phone: "12345678",
                answer: "test answer",
                role: 1, // admin
            });
        }

        // Middleware to mock logged-in user
        app.use((req, res, next) => {
            req.user = user; // fake logged-in user
            next();
        });

        // Mount routes directly without real middleware
        app.put("/api/profile", updateProfileController);
        app.get("/api/orders", getOrdersController);
        app.get("/api/all-orders", getAllOrdersController);
        app.put("/api/order-status/:orderId", orderStatusController);
        app.get("/api/all-users", getAllUsersController);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Create a dummy category
        testCategory = await categoryModel.create({
            name: "Test Category",
            slug: "test-category",
        });

        // Create a dummy product using the category
        testProduct = await productModel.create({
            name: "Test Product",
            slug: "test-product",
            description: "A product for testing",
            price: 10,
            category: testCategory._id,
            quantity: 5,
        });

        await userModel.findByIdAndUpdate(user._id, { name: "John Doe", address: "Old Address" });
    });

    afterEach(async () => {
        // Delete only the orders created for this user
        await orderModel.deleteMany({ buyer: user._id });

        // Delete only the product created for this test
        if (testProduct) {
            await productModel.deleteOne({ _id: testProduct._id });
            testProduct = null;
        }

        // Delete only the category created for this test
        if (testCategory) {
            await categoryModel.deleteOne({ _id: testCategory._id });
            testCategory = null;
        }
    });

    // ---------------- Update Profile ----------------
    it("should return error if password is less than 6 characters", async () => {
        const res = await request(app)
            .put("/api/profile")
            .send({ password: "123" });

        expect(res.body.error).toBe("Passsword is required and 6 character long");
    });

    it("should update profile successfully for all fields", async () => {
        const updatedData = {
            name: "New Name",
            address: "New Address",
            phone: "98765432"
        };

        const res = await request(app)
            .put("/api/profile")
            .send(updatedData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // The updated user returned in response
        const updatedUser = res.body.updatedUser;
        expect(updatedUser.name).toBe(updatedData.name);
        expect(updatedUser.address).toBe(updatedData.address);
        expect(updatedUser.phone).toBe(updatedData.phone);

        // Verify database actually updated
        const userInDb = await userModel.findById(user._id).lean();
        expect(userInDb.name).toBe(updatedData.name);
        expect(userInDb.address).toBe(updatedData.address);
        expect(userInDb.phone).toBe(updatedData.phone);
    });


    // ---------------- User Orders ----------------
    it("should return user's own orders", async () => {
        await orderModel.create({
            buyer: user._id,
            products: [testProduct._id],
            status: "Not Process",
        });

        const res = await request(app).get("/api/orders");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].buyer.name).toBe("John Doe");
    });

    // ---------------- All Orders (Admin) ----------------
    it("should return all orders", async () => {
        await orderModel.create({
            buyer: user._id,
            products: [testProduct._id],
            status: "Not Process",
        });

        const res = await request(app).get("/api/all-orders");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].buyer.name).toBe("John Doe");
    });

    // ---------------- Update Order Status ----------------
    it("should update order status", async () => {
        const order = await orderModel.create({
            buyer: user._id,
            products: [testProduct._id],
            status: "Not Process",
        });

        const res = await request(app)
            .put(`/api/order-status/${order._id}`)
            .send({ status: "Shipped" });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("Shipped");

        const updated = await orderModel.findById(order._id);
        expect(updated.status).toBe("Shipped");
    });

    // ---------------- Get All Users ----------------
    it("should return all users without passwords", async () => {
        const res = await request(app).get("/api/all-users");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.users)).toBe(true);
        expect(res.body.users[0]).not.toHaveProperty("password");
    });
});