import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { HttpError } from "../lib/httpError";
import { Prisma } from "../../generated/prisma/client";

export type TokenPair = { token: string; refreshToken: string };

export async function signupUser(input: {
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
  password: string;
}): Promise<TokenPair> {
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
      select: { id: true, role: true },
    });

    return {
      token: signAccessToken(user.id, user.role),
      refreshToken: signRefreshToken(user.id, user.role),
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, "Email or student_id already in use");
    }
    throw err;
  }
}

export async function loginUser(email: string, password: string): Promise<TokenPair> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, password: true },
  });

  if (!user) {
    throw new HttpError(401, "No account found with that email address");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new HttpError(401, "Incorrect password. Please try again");
  }

  return {
    token: signAccessToken(user.id, user.role),
    refreshToken: signRefreshToken(user.id, user.role),
  };
}

export async function getProfile(userId: string) {
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

  if (!user) throw new HttpError(404, "User not found");
  return user;
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const payload = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true },
  });

  if (!user) throw new HttpError(401, "User no longer exists");

  return {
    token: signAccessToken(user.id, user.role),
    refreshToken: signRefreshToken(user.id, user.role),
  };
}
