import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { HttpError } from "../lib/httpError";
import * as authService from "../services/authService";

const emailSchema = z.string().refine(
  (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  { message: "Invalid email address" }
);

const signupSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: emailSchema,
  student_id: z.string().min(1).max(50),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
  role: z.enum(["admin", "student"]).optional(),
});

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const input = signupSchema.parse(req.body);
    const tokens = await authService.signupUser(input);
    return res.status(201).json(tokens);
  } catch (err) {
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const tokens = await authService.loginUser(input.email, input.password, input.role);
    return res.json(tokens);
  } catch (err) {
    return next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new HttpError(401, "Unauthorized"));

    const user = await authService.getProfile(userId);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new HttpError(400, "refreshToken is required"));
    }

    const tokens = await authService.refreshTokens(refreshToken);
    return res.json(tokens);
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    if (process.env.NODE_ENV !== "production") {
      console.warn("[refresh] token verification failed:", err instanceof Error ? err.message : err);
    }
    return next(new HttpError(401, "Invalid or expired refresh token"));
  }
}

export function logout(_req: Request, res: Response) {
  return res.status(204).send();
}
