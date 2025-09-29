import {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "./authController.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import { describe } from "node:test";

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
});
