type DbRetryableCode = "ETIMEDOUT" | "P1001";

function isRetryablePrismaError(err: unknown): err is { code?: string } {
  const code = (err as any)?.code;
  if (!code || typeof code !== "string") return false;
  return code === "ETIMEDOUT" || code === "P1001";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries Prisma calls when the database is temporarily unreachable/timing out.
 * This prevents the UI from getting a hard 500 on the first transient failure.
 */
export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  options?: { retries?: number; baseDelayMs?: number },
): Promise<T> {
  const retries = options?.retries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 300;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastErr = err;
      if (!isRetryablePrismaError(err)) throw err;
      if (attempt === retries) throw err;

      const delay = baseDelayMs * Math.pow(2, attempt); // exponential backoff
      await sleep(delay);
    }
  }

  // Should be unreachable, but TS wants a return.
  throw lastErr;
}

