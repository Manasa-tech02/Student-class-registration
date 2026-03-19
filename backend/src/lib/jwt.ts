import jwt from "jsonwebtoken";

type JwtPayload = {
  role?: string;
  sub?: string;
  type?: "access" | "refresh";
};

const ACCESS_TOKEN_DEFAULT_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_DEFAULT_EXPIRY = 7 * 24 * 60 * 60; // 7 days

function getSecret(kind: "access" | "refresh"): string {
  if (kind === "refresh") {
    if (process.env.JWT_REFRESH_SECRET) return process.env.JWT_REFRESH_SECRET;
    if (process.env.NODE_ENV !== "production") return "insecure-dev-refresh-secret";
    throw new Error("Missing JWT_REFRESH_SECRET");
  }

  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== "production") return "insecure-dev-secret";
  throw new Error("Missing JWT_SECRET");
}

function parseExpiry(envVar: string | undefined, fallback: number): number {
  const parsed = Number(envVar);
  return Number.isNaN(parsed) ? fallback : parsed;
}

// ── Access Token ──

export function signAccessToken(userId: string, role: string): string {
  return jwt.sign(
    { role, sub: userId, type: "access" } satisfies JwtPayload,
    getSecret("access"),
    { expiresIn: parseExpiry(process.env.JWT_EXPIRES_IN, ACCESS_TOKEN_DEFAULT_EXPIRY) },
  );
}

export function verifyAccessToken(token: string): { userId: string; role: string } {
  const decoded = jwt.verify(token, getSecret("access")) as jwt.JwtPayload & JwtPayload;

  if (decoded.type !== "access") throw new Error("Expected access token");
  if (!decoded.sub) throw new Error("Invalid token payload");

  return { userId: String(decoded.sub), role: decoded.role ?? "student" };
}

// ── Refresh Token ──

export function signRefreshToken(userId: string, role: string): string {
  return jwt.sign(
    { role, sub: userId, type: "refresh" } satisfies JwtPayload,
    getSecret("refresh"),
    { expiresIn: parseExpiry(process.env.JWT_REFRESH_EXPIRES_IN, REFRESH_TOKEN_DEFAULT_EXPIRY) },
  );
}

export function verifyRefreshToken(token: string): { userId: string; role: string } {
  const decoded = jwt.verify(token, getSecret("refresh")) as jwt.JwtPayload & JwtPayload;

  if (decoded.type !== "refresh") throw new Error("Expected refresh token");
  if (!decoded.sub) throw new Error("Invalid token payload");

  return { userId: String(decoded.sub), role: decoded.role ?? "student" };
}

