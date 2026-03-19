import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

export const coursesRouter = Router();

coursesRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        class_name: true,
        professor: true,
        duration: true,
        rating: true,
        description: true,
        capacity: true,
        created_at: true,
      },
    });

    return res.json({ courses });
  } catch (err) {
    return next(err);
  }
});

