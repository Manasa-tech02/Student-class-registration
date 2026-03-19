import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import * as authController from "../controllers/authController";

export const authRouter = Router();

authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);
authRouter.get("/me", requireAuth, authController.me);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", requireAuth, authController.logout);
