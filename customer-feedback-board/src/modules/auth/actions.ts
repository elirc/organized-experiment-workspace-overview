"use server";

import { redirect } from "next/navigation";
import { getDemoUserById } from "./demo-users";
import { clearDemoSession, setDemoSession } from "./session";

export async function loginAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const user = getDemoUserById(userId);
  if (!user) {
    redirect("/login?error=invalid-user");
  }
  await setDemoSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await clearDemoSession();
  redirect("/");
}
