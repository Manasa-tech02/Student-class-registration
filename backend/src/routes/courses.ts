import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import * as courseController from "../controllers/courseController";

export const coursesRouter = Router();

coursesRouter.get("/", requireAuth, courseController.getAll);
