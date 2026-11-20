import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type RoleType = "ADMIN" | "OFFICER" | "CITIZEN";

/**
 * Get the current authenticated session or redirect to login.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }
  return session;
}

/**
 * Require a specific role or higher. Redirects to unauthorized or home page.
 */
export async function requireRole(...roles: RoleType[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    redirect("/auth/login?error=unauthorized");
  }
  return session;
}

/**
 * Get session for API routes - returns null instead of redirecting.
 */
export async function getApiSession() {
  const session = await auth();
  return session;
}

/**
 * Require auth for API routes - returns session or throws.
 */
export async function requireApiAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Require role for API routes - returns session or throws.
 */
export async function requireApiRole(...roles: RoleType[]) {
  const session = await requireApiAuth();
  if (!roles.includes(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

/**
 * Create a standardized API error response.
 */
export function apiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * Create a standardized API success response.
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return Response.json({ data }, { status });
}
