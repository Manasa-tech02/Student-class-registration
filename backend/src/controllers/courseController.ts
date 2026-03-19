import type { Request, Response, NextFunction } from "express";
import * as courseService from "../services/courseService";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const courses = await courseService.getAllCourses();
    return res.json({ courses });
  } catch (err) {
    return next(err);
  }
}
