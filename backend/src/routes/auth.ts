import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { HttpError } from "../lib/httpError";
import { requireAuth } from "../middleware/requireAuth";
import { Prisma } from "../../generated/prisma/client";

export const authRouter = Router();

const signupSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  student_id: z.string().min(1).max(50),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

authRouter.post("/signup", async (req, res, next) => {
  const input = signupSchema.parse(req.body);

  const hashedPassword = await bcrypt.hash(input.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        student_id: input.student_id,
        password: hashedPassword,
        role: "student",
      },
      select: {
        id: true,
        role: true,
      },
    });

    const token = signAccessToken(user.id, user.role);
    return res.status(201).json({ token });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return next(new HttpError(409, "Email or student_id already in use"));
    }
    return next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  const input = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, role: true, password: true },
  });

  if (!user) {
    return next(new HttpError(401, "No account found with that email address"));
  }

  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) {
    return next(new HttpError(401, "Incorrect password. Please try again"));
  }

  const token = signAccessToken(user.id, user.role);
  return res.json({ token });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return next(new HttpError(401, "Unauthorized"));

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      student_id: true,
      role: true,
      created_at: true,
    },
  });

  if (!user) return next(new HttpError(404, "User not found"));
  return res.json({ user });
});

