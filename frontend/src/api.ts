export type ApiErrorResponse = { error?: string; details?: unknown };

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
  role: string;
  created_at: string; // returned as ISO string by backend
};

export type Course = {
  id: string;
  class_name: string;
  professor: string;
  duration: string;
  rating: number;
  description: string;
  capacity: number;
  created_at: string; // returned as ISO string by backend
};

function getApiUrl(): string {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL as string | undefined;
  if (!apiUrl) throw new Error("Missing EXPO_PUBLIC_API_URL");
  return apiUrl;
}

async function handleResponse(res: Response) {
  if (res.ok) return;
  let body: ApiErrorResponse | undefined;
  try {
    body = (await res.json()) as ApiErrorResponse;
  } catch {
    body = undefined;
  }
  const message = getErrorMessage(res.status, body);
  throw new Error(message);
}

function getErrorMessage(status: number, body?: ApiErrorResponse): string {
  const fieldMessage = extractFieldValidationMessage(body?.details);
  if (fieldMessage) return fieldMessage;
  if (typeof body?.error === "string" && body.error.trim().length > 0) return body.error;

  switch (status) {
    case 400:
      return "Please check your input and try again.";
    case 401:
      return "Your email or password is incorrect.";
    case 409:
      return "An account with these details already exists.";
    default:
      return `Request failed with HTTP ${status}`;
  }
}

function extractFieldValidationMessage(details: unknown): string | null {
  if (
    !details ||
    typeof details !== "object" ||
    !("fieldErrors" in details) ||
    !details.fieldErrors ||
    typeof details.fieldErrors !== "object"
  ) {
    return null;
  }

  const fieldErrors = details.fieldErrors as Record<string, unknown>;
  const firstField = Object.keys(fieldErrors)[0];
  if (!firstField) return null;

  const firstErrorForField = fieldErrors[firstField];
  if (!Array.isArray(firstErrorForField)) return null;

  const firstMessage = firstErrorForField[0];
  if (typeof firstMessage !== "string" || firstMessage.trim().length === 0) return null;

  const prettyFieldName = firstField.replaceAll("_", " ");
  return `${prettyFieldName}: ${firstMessage}`;
}

export async function signup(input: {
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
  password: string;
}): Promise<{ token: string }> {
  const res = await fetch(`${getApiUrl()}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await handleResponse(res);
  return (await res.json()) as { token: string };
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<{ token: string }> {
  const res = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await handleResponse(res);
  return (await res.json()) as { token: string };
}

export async function getMe(token: string): Promise<{ user: User }> {
  const res = await fetch(`${getApiUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
  return (await res.json()) as { user: User };
}

export async function getCourses(token: string): Promise<{ courses: Course[] }> {
  const res = await fetch(`${getApiUrl()}/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
  return (await res.json()) as { courses: Course[] };
}

