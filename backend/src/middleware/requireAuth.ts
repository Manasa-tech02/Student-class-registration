import type express from "express";
import { HttpError } from "../lib/httpError";
import { verifyAccessToken } from "../lib/jwt";

export function requireAuth(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing or invalid Authorization header"));
  }

  const token = authorization.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
}

