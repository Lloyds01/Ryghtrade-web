import { NextResponse } from "next/server";
import { BackendError } from "./mock-backend";

/** The mock only answers when no real backend is configured. */
const MOCK_ENABLED = !process.env.NEXT_PUBLIC_API_BASE;

export function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Runs a mock route body and turns BackendErrors into the backend's JSON error responses. */
export async function handle<T>(fn: () => Promise<T>, successStatus = 200): Promise<NextResponse> {
  if (!MOCK_ENABLED) return NextResponse.json({ message: "Not found" }, { status: 404 });
  try {
    return NextResponse.json(await fn(), { status: successStatus });
  } catch (err) {
    if (err instanceof BackendError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ status: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
