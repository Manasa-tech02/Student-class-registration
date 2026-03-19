import jwt from "jsonwebtoken";

type JwtPayload = {
  role?: string;
  sub?: string;
};

function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  // Dev fallback to keep local work moving if env isn't configured yet.
  if (process.env.NODE_ENV !== "production") return "insecure-dev-secret";

  throw new Error("Missing JWT_SECRET");
}

export function signAccessToken(userId: string, role: string): string {
  const expiresInSeconds = process.env.JWT_EXPIRES_IN
    ? Number(process.env.JWT_EXPIRES_IN)
    : 7 * 24 * 60 * 60;

  return jwt.sign(
    { role, sub: userId } satisfies JwtPayload,
    getJwtSecret(),
    {
      expiresIn: Number.isNaN(expiresInSeconds) ? 7 * 24 * 60 * 60 : expiresInSeconds,
    },
  );
}

export function verifyAccessToken(token: string): { userId: string; role: string } {
  const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload & JwtPayload;

  const userId = decoded.sub;
  const role = decoded.role;

  if (!userId) throw new Error("Invalid token payload");
  return { userId: String(userId), role: role ?? "student" };
}

