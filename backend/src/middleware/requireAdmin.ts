import type express from "express";
import { HttpError } from "../lib/httpError";

export function requireAdmin(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) {
  if (req.user?.role !== "admin") {
    return next(new HttpError(403, "Admin access required"));
  }
  return next();
}
