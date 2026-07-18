"use server";

import { redirect } from "next/navigation";
import { setDemoSession, clearDemoSession } from "./session";
import { getDemoUserById } from "./demo-users";

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
  redirect("/login");
}
