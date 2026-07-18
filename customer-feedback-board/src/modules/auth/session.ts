import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDemoUserById, type DemoUser, type FeedbackRole } from "./demo-users";

const SESSION_COOKIE = "feedback_demo_user";

export async function getCurrentUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  return getDemoUserById(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(roles: FeedbackRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}

export async function setDemoSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
}

export async function clearDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function canModerate(user: DemoUser | null) {
  return user?.role === "moderator" || user?.role === "product_manager" || user?.role === "admin";
}

export function canManageRoadmap(user: DemoUser | null) {
  return user?.role === "product_manager" || user?.role === "admin";
}

export function canManageSettings(user: DemoUser | null) {
  return user?.role === "admin";
}
