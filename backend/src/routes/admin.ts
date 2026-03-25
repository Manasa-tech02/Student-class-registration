import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import * as adminController from "../controllers/adminController";

export const adminRouter = Router();

// Every admin route requires a valid JWT AND the user's role must be "admin".
// requireAuth  → checks Authorization header, decodes JWT, sets req.user
// requireAdmin → checks req.user.role === "admin", rejects everyone else
adminRouter.use(requireAuth, requireAdmin);

// ── Dashboard ──────────────────────────────────────────────────────────────
// GET /admin/stats  →  total students, courses, enrollments
adminRouter.get("/stats", adminController.getDashboardStats);

// ── Students ───────────────────────────────────────────────────────────────
// GET /admin/students           →  all students (optional ?search=)
// GET /admin/students/:id       →  single student + their enrolled courses
adminRouter.get("/students",     adminController.getAllStudents);
adminRouter.get("/students/:id", adminController.getStudentDetail);

// ── Courses (CRUD) ─────────────────────────────────────────────────────────
// POST   /admin/courses          →  create a course
// PUT    /admin/courses/:id      →  update a course
// DELETE /admin/courses/:id      →  delete course + its enrollments
adminRouter.post(  "/courses",     adminController.createCourse);
adminRouter.put(   "/courses/:id", adminController.updateCourse);
adminRouter.delete("/courses/:id", adminController.deleteCourse);

// ── Course Enrollments ─────────────────────────────────────────────────────
// GET    /admin/courses/:id/enrollments  →  students enrolled in a course
// DELETE /admin/enrollments/:id          →  remove a student from a course
adminRouter.get(   "/courses/:id/enrollments", adminController.getCourseEnrollments);
adminRouter.delete("/enrollments/:id",         adminController.removeEnrollment);
