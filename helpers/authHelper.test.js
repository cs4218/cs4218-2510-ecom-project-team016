import bcrypt from "bcrypt";
import { comparePassword, hashPassword } from "./authHelper";
import { afterEach, beforeEach } from "node:test";

jest.mock("bcrypt");

describe("hash password unit test", () => {
  const DEFAULT_SALT = 10;
  const password = "test-password";
  const hashed_password = "hashed-password";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should call bcrypt hash once with correct params", async () => {
    bcrypt.hash.mockReturnValue(Promise.resolve(hashed_password));

    await hashPassword(password);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith(password, DEFAULT_SALT);
  });

  test("should return hashed password when called", async () => {
    bcrypt.hash.mockReturnValue(Promise.resolve(hashed_password));

    const hash = await hashPassword(password);

    expect(hash).toBe(hashed_password);
    expect(password).not.toBe(hash);
  });
});

describe("compare password unit test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return true when passwords match", async () => {
    const password = "correct-password";
    const hashedPassword = "correct-hash";
    bcrypt.compare.mockReturnValue(Promise.resolve(true));

    const res = await comparePassword(password, hashedPassword);

    expect(res).toBe(true);
  });

  test("should return false when passwords don't match", async () => {
    const password = "wrong-password";
    const hashedPassword = "correct-hash";

    bcrypt.compare.mockReturnValue(Promise.resolve(false));

    const res = await comparePassword(password, hashedPassword);

    expect(res).toBe(false);
  });

  test("bcrypt should be called once", async () => {
    const password = "correct-password";
    const hashedPassword = "correct-hash";

    bcrypt.compare.mockClear();
    bcrypt.compare.mockReturnValue(Promise.resolve(true));
    await comparePassword(password, hashedPassword);

    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
  });
});
