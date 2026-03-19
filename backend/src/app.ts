import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { coursesRouter } from "./routes/courses";
import { HttpError } from "./lib/httpError";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? true,
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use(
    "/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );
  app.use("/auth", authRouter);
  app.use("/courses", coursesRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  // Error handler (keep it last)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let details: unknown;

    if (err instanceof HttpError) {
      statusCode = err.statusCode;
      message = err.message;
      details = err.details;
    } else if (err instanceof ZodError) {
      statusCode = 400;
      message = "Invalid request";
      details = err.flatten();
    } else if (err instanceof Error && process.env.NODE_ENV !== "production") {
      // In dev, it's useful to show real error messages.
      message = err.message;
    }

    // Avoid exposing sensitive details in production.
    res.status(statusCode).json(
      details === undefined ? { error: message } : { error: message, details },
    );
  });

  return app;
}

