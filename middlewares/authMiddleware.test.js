import JWT from "jsonwebtoken";
import { isAdmin, requireSignIn } from "./authMiddleware";
import userModel from "../models/userModel";
import { afterEach } from "node:test";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel");

describe("authMiddleware unit test", () => {
  let req, res, next;
  const TEST_JWT_SECRET = "test-secret";
  const OLD_ENV = process.env.JWT_SECRET;

  beforeEach(() => {
    jest.resetModules();
    req = {
      headers: {
        authorization: "Bearer valid-token",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();

    // Set up environment variable
    process.env.JWT_SECRET = TEST_JWT_SECRET;

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.JWT_SECRET = OLD_ENV;
  });

  test("should call JWT.verify with correct params and call next on success", async () => {
    JWT.verify.mockReturnValue(null);

    await requireSignIn(req, res, next);

    expect(JWT.verify).toHaveBeenCalledWith(
      "Bearer valid-token",
      TEST_JWT_SECRET
    );
    expect(JWT.verify).toHaveBeenCalledTimes(1);
  });

  test("verify req is attached with decode information", async () => {
    const mockUser = { _id: "user123", email: "test@example.com" };

    JWT.verify.mockResolvedValue(mockUser);

    await requireSignIn(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should send status 500 when JWT verify throws error", async () => {
    const error = new Error("JWT verify error");
    JWT.verify.mockRejectedValue(error);

    await requireSignIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in requireSignIn middleware",
      error,
    });
  });
});

describe("isAdmin unit test", () => {
  const TEST_ADMIN_ID = "test-admin-id";
  const TEST_USER_ID = "test-user-id";
  const TEST_USER_ID_INVALID = "test-user-invalid-id";
  const mock_admin_user = {
    role: 1,
  };
  const mock_non_admin_user = {
    role: 0,
  };

  let req, res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();

    userModel.findById.mockImplementation((user_id) => {
      if (user_id == TEST_ADMIN_ID) {
        return mock_admin_user;
      }

      if (user_id == TEST_USER_ID) {
        return mock_non_admin_user;
      }

      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send status 404 when user not found", async () => {
    req = {
      user: {
        _id: TEST_USER_ID_INVALID,
      },
    };

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  test("should send status 401 when user not an admin", async () => {
    req = {
      user: {
        _id: TEST_USER_ID,
      },
    };

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "UnAuthorized Access",
    });
  });

  test("should send status 400 when req.user is undefined", async () => {
    req = {};

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Missing user from req body",
    });
  });

  test("should send status 400 when req.user._id is undefined", async () => {
    req = {
      user: {},
    };

    await isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Missing user from req body",
    });
  });

  test("should call next() when user found and isAdmin", async () => {
    req = {
      user: {
        _id: TEST_ADMIN_ID,
      },
    };

    await isAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should send status 401 for database errors", async () => {
    const error = new Error("Database error");
    userModel.findById.mockRejectedValue(error);

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in admin middleware",
      error,
    });
  });
});
