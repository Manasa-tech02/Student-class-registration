import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import * as enrollmentController from "../controllers/enrollmentController";

export const enrollmentsRouter = Router();

enrollmentsRouter.post("/", requireAuth, enrollmentController.enroll);
enrollmentsRouter.delete("/", requireAuth, enrollmentController.drop);
enrollmentsRouter.get("/courses", requireAuth, enrollmentController.myCourses);
