import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Use this in API routes and server components to get the logged-in user.
// Returns null if nobody is logged in.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

// Use this in admin-only API routes. Returns the user if they're an admin,
// or null if not logged in / not an admin.
export async function getCurrentAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}