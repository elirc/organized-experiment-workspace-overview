import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDemoUserById, type DemoUser } from "./demo-users";

const SESSION_COOKIE = "crm_demo_user";

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

export function canManageAdmin(user: DemoUser) {
  return user.role === "founder_admin";
}

export function isReadOnlyUser(user: DemoUser) {
  return user.role === "analyst";
}

export function canWriteOwnedRecords(user: DemoUser) {
  return user.role === "founder_admin" || user.role === "sales_rep";
}

export function canEditOwnedRecord(user: DemoUser, ownerId: string | null | undefined) {
  if (user.role === "founder_admin") {
    return true;
  }

  return user.role === "sales_rep" && ownerId === user.id;
}
