import { configuration } from "./config";
import { supabase } from "./supabase";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!supabase)
    throw new ApiError(
      "The workspace connection has not been configured.",
      503,
    );
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new ApiError("Please sign in again.", 401);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${data.session.access_token}`);
  if (typeof init.body === "string")
    headers.set("Content-Type", "application/json");
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (init.signal?.aborted) abort();
  else init.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 90000);
  try {
    const response = await fetch(configuration.apiUrl + path, {
      ...init,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    const raw = await response.text();
    let body;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      throw new ApiError(
        response.status === 413
          ? "Choose a smaller photo or shorter video."
          : "The service returned an invalid response.",
        response.status,
      );
    }
    if (!response.ok) {
      const detail = body?.detail;
      throw new ApiError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((item: { msg: string }) => item.msg).join(". ")
            : "The request failed.",
        response.status,
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted)
      throw new ApiError(
        init.signal?.aborted
          ? "Request canceled."
          : "The service took too long. Try again.",
        408,
      );
    throw new ApiError(
      "Could not reach the model service. Check your connection.",
      0,
    );
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener("abort", abort);
  }
}
