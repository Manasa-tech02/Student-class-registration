import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as adminService from "../services/adminService";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const courseSchema = z.object({
  class_name:  z.string().min(1).max(200),
  professor:   z.string().min(1).max(200),
  duration:    z.string().min(1).max(100),
  rating:      z.number().min(0).max(5),
  description: z.string().min(1),
  capacity:    z.number().int().min(1),
});

const courseUpdateSchema = courseSchema.partial(); // all fields optional for PUT

// ─── GET /admin/stats ─────────────────────────────────────────────────────────

export async function getDashboardStats(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stats = await adminService.getDashboardStats();
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
}

// ─── GET /admin/students ──────────────────────────────────────────────────────
// Supports optional ?search= query param for filtering by name, email, student_id

export async function getAllStudents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const students = await adminService.getAllStudents(search);
    return res.json({ students });
  } catch (err) {
    return next(err);
  }
}

// ─── GET /admin/students/:id ──────────────────────────────────────────────────

export async function getStudentDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const student = await adminService.getStudentDetail(req.params.id as string);
    return res.json({ student });
  } catch (err) {
    return next(err);
  }
}

// ─── POST /admin/courses ──────────────────────────────────────────────────────

export async function createCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = courseSchema.parse(req.body);
    const course = await adminService.createCourse(input);
    return res.status(201).json({ course });
  } catch (err) {
    return next(err);
  }
}

// ─── PUT /admin/courses/:id ───────────────────────────────────────────────────

export async function updateCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = courseUpdateSchema.parse(req.body);
    const course = await adminService.updateCourse(req.params.id as string, input);
    return res.json({ course });
  } catch (err) {
    return next(err);
  }
}

// ─── DELETE /admin/courses/:id ────────────────────────────────────────────────

export async function deleteCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await adminService.deleteCourse(req.params.id as string);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

// ─── GET /admin/courses/:id/enrollments ───────────────────────────────────────

export async function getCourseEnrollments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await adminService.getCourseEnrollments(req.params.id as string);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

// ─── DELETE /admin/enrollments/:id ───────────────────────────────────────────

export async function removeEnrollment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await adminService.removeEnrollment(req.params.id as string);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
