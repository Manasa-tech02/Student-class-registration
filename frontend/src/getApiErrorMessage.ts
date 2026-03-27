type ApiErrorShape = {
  data?: {
    error?: string;
  };
  error?: string;
  message?: string;
  status?: number | string;
};

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape | undefined;

  const backendMessage = e?.data?.error?.trim();
  if (backendMessage) return backendMessage;

  const transportMessage = e?.error?.trim();
  if (transportMessage) {
    // RTK Query fetchBaseQuery uses status "FETCH_ERROR" for network-level failures.
    if (e?.status === "FETCH_ERROR") {
      return `${transportMessage}. Check EXPO_PUBLIC_API_URL and ensure backend is running/reachable.`;
    }
    return transportMessage;
  }

  const genericMessage = e?.message?.trim();
  if (genericMessage) return genericMessage;

  return fallback;
}
