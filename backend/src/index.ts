import dotenv from "dotenv";

// Load backend-local env so app and Prisma use the same DB_URL.
dotenv.config({ path: ".env" });

// Ensure dotenv is loaded before importing anything that depends on env vars (e.g. Prisma).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApp } = require("./app") as typeof import("./app");

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const app = createApp();
app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://${host}:${port}`);
});

