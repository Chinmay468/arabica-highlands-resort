"use server";

import { setSessionUser, clearSessionUser, getCurrentUser, SessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function loginAction(email: string): Promise<{ success: boolean; user?: SessionUser; error?: string }> {
  try {
    const user = await setSessionUser(email);
    revalidatePath("/", "layout");
    return { success: true, user };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  await clearSessionUser();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getSessionAction(): Promise<SessionUser> {
  return await getCurrentUser();
}
