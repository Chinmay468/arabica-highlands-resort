import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "GUEST" | "STAFF" | "GM";
}

const SESSION_COOKIE_NAME = "ah_session_user";

/**
 * Retrieves the currently logged in user from cookie session.
 * Falls back to demo GUEST if no cookie is set.
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const sessionVal = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionVal) {
    try {
      const parsed = JSON.parse(sessionVal) as SessionUser;
      if (parsed.email && parsed.role) {
        return parsed;
      }
    } catch {
      // Invalid cookie format, fallback
    }
  }

  // Fallback to guest user
  const guest = await prisma.user.findUnique({
    where: { email: "guest@example.com" },
  });

  if (guest) {
    return {
      id: guest.id,
      email: guest.email,
      name: guest.name,
      role: guest.role as SessionUser["role"],
    };
  }

  return {
    id: "guest-default",
    email: "guest@example.com",
    name: "Karthik Subramanian (Guest)",
    role: "GUEST",
  };
}

/**
 * Log in as one of the pre-seeded users by email
 */
export async function setSessionUser(email: string): Promise<SessionUser> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw new Error(`User with email "${email}" not found.`);
  }

  const sessionData: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SessionUser["role"],
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return sessionData;
}

/**
 * Clear user session (logout)
 */
export async function clearSessionUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
