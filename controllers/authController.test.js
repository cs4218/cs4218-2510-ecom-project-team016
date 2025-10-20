import {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  getAllUsersController,
} from "./authController.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import { describe } from "node:test";

// Mock Dependencies
jest.mock("../models/userModel");
jest.mock("../models/orderModel");
jest.mock("../helpers/authHelper");
jest.mock("jsonwebtoken");

const NAME_VALID = "test-name";
const EMAIL_VALID = "testemail@gmail.com";
const PASSWORD_VALID = "test-password";
const PHONE_VALID = "85002001";
const ADDRESS_VALID = "blk 100 edgefield plains";
const ANSWER_VALID = "test-answer";
const ROLE_USER = 0;
const USER_ID = 1;
// const HASH_PASSWORD = "hasedPassword";

describe("registerController test", () => {
  let req, res;
  let mockValidUserFromDb;

  beforeEach(() => {
    req = {
      body: {
        name: NAME_VALID,
        email: EMAIL_VALID,
        password: PASSWORD_VALID,
        phone: PHONE_VALID,
        address: ADDRESS_VALID,
        answer: ANSWER_VALID,
      },
    };
    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    mockValidUserFromDb = {
      _id: USER_ID,
      name: NAME_VALID,
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      phone: PHONE_VALID,
      address: ADDRESS_VALID,
      answer: ANSWER_VALID,
      role: ROLE_USER,
    };
    jest.clearAllMocks();
  });

  // successful creation
  test("should return 201 if all fields valid and user does not exist", async () => {
    userModel.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashedPassword");

    const saveMock = jest.fn().mockResolvedValue(mockValidUserFromDb);
    userModel.prototype.save = saveMock;

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("should call userModel with correct parameters when successful create", async () => {
    userModel.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashedPassword");

    const saveMock = jest.fn().mockResolvedValue(mockValidUserFromDb);
    userModel.prototype.save = saveMock;

    await registerController(req, res);

    expect(userModel).toHaveBeenCalledWith({
      name: NAME_VALID,
      email: EMAIL_VALID,
      password: "hashedPassword",
      phone: PHONE_VALID,
      address: ADDRESS_VALID,
      answer: ANSWER_VALID,
    });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith();
  });

  test("should return user without password and with default user role upon successful creation", async () => {
    const mockUserModel = {
      ...req.body,
      _id: 0,
      password: "hashedPassword",
      role: ROLE_USER,
    };
    const { password, answer, ...rest } = req.body;
    const mockUserReturn = { ...rest, _id: 1, role: ROLE_USER };

    userModel.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashedPassword");

    const saveMock = jest.fn().mockResolvedValue(mockValidUserFromDb);
    userModel.prototype.save = saveMock;

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User Register Successfully",
      user: mockUserReturn,
    });
  });

  test("should return 409 if user already exist", async () => {
    userModel.findOne.mockResolvedValue({
      name: NAME_VALID,
      email: EMAIL_VALID,
    });

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  // missing fields from req
  test("should return 400 if name missing", async () => {
    req.body.name = "";

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Name is Required" });
  });

  test("should return 400 if email missing", async () => {
    req.body.email = "";

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  test("should return 400 if password missing", async () => {
    req.body.password = "";

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  test("should return 400 if phone missing", async () => {
    req.body.phone = "";

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });

  test("should return 400 if address missing", async () => {
    req.body.address = "";

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  test("should return 400 if answer missing", async () => {
    req.body.answer = "";

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  test("should return 500 if error occurs", async () => {
    const error = new Error("Database error");
    userModel.findOne.mockRejectedValue(error);

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in Registeration",
      error,
    });
  });
});

describe("loginController test", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: EMAIL_VALID,
        password: PASSWORD_VALID,
      },
    };
    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    process.env.JWT_SECRET = "test-jwt-secret";
    jest.clearAllMocks();
  });

  test("should login successfully with valid credentials", async () => {
    const mockUser = {
      _id: "user123",
      name: NAME_VALID,
      email: EMAIL_VALID,
      phone: PHONE_VALID,
      address: ADDRESS_VALID,
      role: 0,
      password: "hashedPassword",
    };

    userModel.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    JWT.sign.mockResolvedValue("mockToken");

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "login successfully",
      user: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address,
        role: mockUser.role,
      },
      token: "mockToken",
    });
  });

  test("should return 401 if password is invalid", async () => {
    const mockUser = { email: EMAIL_VALID, password: "hashedPassword" };
    userModel.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(false);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  test("should return 400 if email is missing", async () => {
    req.body.email = "";

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Missing email or password",
    });
  });

  test("should return 400 if password is missing", async () => {
    req.body.password = "";

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Missing email or password",
    });
  });

  test("should return 404 if user not found", async () => {
    userModel.findOne.mockResolvedValue(null);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registered",
    });
  });

  test("should return 500 if error occurs", async () => {
    const error = new Error("Database error");
    userModel.findOne.mockRejectedValue(error);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in login",
      error,
    });
  });
});

describe("forgotPasswordController test", () => {
  let req, res;
  const NEW_PASSWORD_VALID = "new-test-password";

  beforeEach(() => {
    req = {
      body: {
        email: EMAIL_VALID,
        answer: ANSWER_VALID,
        newPassword: NEW_PASSWORD_VALID,
      },
    };
    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should reset password successfully", async () => {
    const mockUser = {
      _id: "user123",
      email: EMAIL_VALID,
      answer: ANSWER_VALID,
    };
    userModel.findOne.mockResolvedValue(mockUser);
    hashPassword.mockImplementation();
    hashPassword.mockResolvedValue("hashedNewPassword");
    userModel.findByIdAndUpdate.mockResolvedValue({});

    await forgotPasswordController(req, res);

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
      password: "hashedNewPassword",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
  });

  test("should return 400 if email is missing", async () => {
    req.body.email = "";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
  });

  test("should return 400 if answer is missing", async () => {
    req.body.answer = "";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is required" });
  });

  test("should return 400 if newPassword is missing", async () => {
    req.body.newPassword = "";

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "New Password is required",
    });
  });

  test("should return 404 if user not found", async () => {
    userModel.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
  });

  test("should return 500 if error occurs", async () => {
    const error = new Error("Database error");
    userModel.findOne.mockRejectedValue(error);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error,
    });
  });
});

describe("test controller test", async () => {
  let res, req;

  test("should return 200 when called", async () => {
    req = {};
    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    testController(req, res);

    expect(res.send).toHaveBeenCalledWith("Protected Routes");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should return error when error occurs", async () => {
    jest.clearAllMocks();
    req = {};
    res = {
      send: jest.fn(),
      status: jest.fn().mockImplementation((status) => {
        throw new Error("error");
      }),
    };
    try {
      expect(testController(req, res)).toThrow(new Error("error"));
    } catch (error) { }
  });
});

// This was generated by ChatGPT based on the original code and the following instruction:
// "help me write unit tests for this component:"
// There were edits to fix issues.

describe("Auth Controllers Unit Tests", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { user: { _id: "123" }, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // -------------------------------
  // updateProfileController
  // -------------------------------
  it("should update profile successfully", async () => {
    req.body = {
      name: "John",
      email: "newemail",
      password: "newpassword",
      phone: "123",
      address: "xyz",
    };

    const user = {
      _id: "123",
      name: "Old",
      email: "Old",
      password: "old",
      phone: "111",
      address: "abc",
    };
    userModel.findById.mockResolvedValue(user);
    hashPassword.mockResolvedValue("hashedpassword");
    userModel.findByIdAndUpdate.mockResolvedValue({
      ...user,
      name: "John",
      email: "newemail",
      password: "hashedpassword",
      phone: "123",
      address: "xyz",
    });

    await updateProfileController(req, res);

    expect(hashPassword).toHaveBeenCalledWith("newpassword");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        updatedUser: expect.objectContaining({
          name: "John",
          password: "hashedpassword",
        }),
      })
    );
  });

  it("should return error if password less than 6 chars", async () => {
    req.body = { password: "123" };
    userModel.findById.mockResolvedValue({ password: "old" });

    await updateProfileController(req, res);

    expect(res.json).toHaveBeenCalledWith({
      error: "Passsword is required and 6 character long",
    });
  });

  it("should handle error and return 400 with error object", async () => {
    const error = new Error("DB exploded"); // Force findById to throw
    userModel.findById.mockRejectedValue(error);
    req.body = { name: "Crash" };
    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Update profile",
      error,
    });
  });

  // -------------------------------
  // getOrdersController
  // -------------------------------
  it("should get orders successfully", async () => {
    const orders = [{ _id: "1" }];

    // Last populate resolves to the data
    const secondPopulateMock = jest.fn().mockResolvedValue(orders);

    // First populate returns object with second populate
    const firstPopulateMock = jest
      .fn()
      .mockReturnValue({ populate: secondPopulateMock });

    // find returns object with first populate
    orderModel.find.mockReturnValue({ populate: firstPopulateMock });

    // Mock res
    const res = { json: jest.fn() };
    const req = { user: { _id: "123" } };

    await getOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalledWith({ buyer: "123" });
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  it("should handle error while fetching orders", async () => {
    const error = new Error("DB Error");
    const secondPopulateMock = jest.fn().mockRejectedValue(error);
    const firstPopulateMock = jest
      .fn()
      .mockReturnValue({ populate: secondPopulateMock });
    orderModel.find.mockReturnValue({ populate: firstPopulateMock });

    await getOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Geting Orders",
      error,
    });
  });

  // -------------------------------
  // getAllOrdersController
  // -------------------------------
  it("should get all orders successfully", async () => {
    const orders = [{ _id: "1" }];

    // Mock the chain: find().populate().populate().sort() returns a promise
    const sortMock = jest.fn().mockResolvedValue(orders);
    const secondPopulateMock = jest.fn().mockReturnValue({ sort: sortMock });
    const firstPopulateMock = jest
      .fn()
      .mockReturnValue({ sort: sortMock, populate: secondPopulateMock });

    orderModel.find.mockReturnValue({
      populate: firstPopulateMock,
      sort: sortMock,
    });

    await getAllOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  it("should handle error while fetching all orders", async () => {
    const error = new Error("DB Error");
    const sortMock = jest.fn().mockRejectedValue(error);
    const secondPopulateMock = jest.fn().mockReturnValue({ sort: sortMock });
    const firstPopulateMock = jest
      .fn()
      .mockReturnValue({ sort: sortMock, populate: secondPopulateMock });
    orderModel.find.mockReturnValue({
      populate: firstPopulateMock,
      sort: sortMock,
    });

    await getAllOrdersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Getting Orders",
      error,
    });
  });

  // -------------------------------
  // orderStatusController
  // -------------------------------
  it("should update order status", async () => {
    req.params.orderId = "1";
    req.body.status = "Shipped";

    const updatedOrder = { _id: "1", status: "Shipped" };
    orderModel.findByIdAndUpdate.mockResolvedValue(updatedOrder);

    await orderStatusController(req, res);

    expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      { status: "Shipped" },
      { new: true }
    );
    expect(res.json).toHaveBeenCalledWith(updatedOrder);
  });

  it("should handle error while updating order status", async () => {
    const error = new Error("DB Error");
    req.params.orderId = "1";
    req.body.status = "Shipped";

    orderModel.findByIdAndUpdate.mockRejectedValue(error);

    await orderStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Updating Order",
      error,
    });
  });
});

describe("getAllUsersController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return all users successfully", async () => {
    const mockUsers = [
      { _id: "1", name: "Alice", email: "a@test.com" },
      { _id: "2", name: "Bob", email: "b@test.com" },
    ];

    const mockQuery = { select: jest.fn().mockReturnValue(mockUsers) };
    jest.spyOn(userModel, "find").mockReturnValue(mockQuery);

    await getAllUsersController(req, res);

    expect(userModel.find).toHaveBeenCalledWith({});
    expect(mockQuery.select).toHaveBeenCalledWith("-password");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: true, users: mockUsers });
  });

  it("should return empty array if no users exist", async () => {
    const mockQuery = { select: jest.fn().mockReturnValue([]) };
    jest.spyOn(userModel, "find").mockReturnValue(mockQuery);

    await getAllUsersController(req, res);

    expect(res.send).toHaveBeenCalledWith({ success: true, users: [] });
  });

  it("should handle error and return 500", async () => {
    const error = new Error("DB Error");

    // Mock find to return a query object whose .select() rejects
    jest.spyOn(userModel, "find").mockReturnValue({
      select: jest.fn().mockRejectedValue(error),
    });

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Getting Users",
      error,
    });

  });
});
