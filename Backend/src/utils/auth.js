const crypto = require("crypto");

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

const base64Url = (value) =>
  Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const base64UrlDecode = (value) =>
  Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [, salt, expectedHex] = String(storedHash).split(":");
  if (!salt || !expectedHex) return false;

  const expected = Buffer.from(expectedHex, "hex");
  const actual = crypto.scryptSync(password, salt, expected.length);

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const signAccessToken = (payload) => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + ACCESS_TOKEN_TTL_SECONDS };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedBody = base64Url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedBody}`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
};

const verifyAccessToken = (token) => {
  const [encodedHeader, encodedBody, signature] = String(token || "").split(".");
  if (!encodedHeader || !encodedBody || !signature) {
    throw new Error("Invalid access token");
  }

  const data = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const supplied = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !crypto.timingSafeEqual(supplied, expected)
  ) {
    throw new Error("Invalid access token");
  }

  const payload = JSON.parse(base64UrlDecode(encodedBody).toString("utf8"));

  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Access token expired");
  }

  return payload;
};

const createRefreshToken = () => crypto.randomBytes(48).toString("hex");

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_MS,
  hashPassword,
  verifyPassword,
  signAccessToken,
  verifyAccessToken,
  createRefreshToken,
  hashRefreshToken,
};
