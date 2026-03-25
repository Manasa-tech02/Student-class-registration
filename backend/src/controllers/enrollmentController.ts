import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { HttpError } from "../lib/httpError";
import * as enrollmentService from "../services/enrollmentService";

const enrollSchema = z.object({
  course_id: z.string().min(1),
});

export async function enroll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new HttpError(401, "Unauthorized"));

    const input = enrollSchema.parse(req.body);
    const enrollment = await enrollmentService.enroll(userId, input.course_id);
    return res.status(201).json({ message: "Enrolled successfully", enrollment });
  } catch (err) {
    return next(err);
  }
}

export async function drop(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new HttpError(401, "Unauthorized"));

    const input = enrollSchema.parse(req.body);
    await enrollmentService.dropCourse(userId, input.course_id);
    return res.json({ message: "Course dropped successfully" });
  } catch (err) {
    return next(err);
  }
}

export async function myCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new HttpError(401, "Unauthorized"));

    const courses = await enrollmentService.getMyCourses(userId);
    return res.json({ courses });
  } catch (err) {
    return next(err);
  }
}
