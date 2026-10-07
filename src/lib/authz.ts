import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export type AuthedUser = {
  id: string;
  email: string;
  role: Role;
  workspaceId: string;
};

export type AuthResult =
  | { ok: true; user: AuthedUser }
  | { ok: false; error: string };

export async function requireMember(): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user?.email) {
    return { ok: false, error: "You must be signed in to do that." };
  }
  if (!session.user.workspaceId) {
    return { ok: false, error: "Join the workspace with an invite code first." };
  }
  return {
    ok: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      workspaceId: session.user.workspaceId,
    },
  };
}

export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireMember();
  if (!result.ok) return result;
  if (result.user.role !== "admin" && result.user.role !== "owner") {
    return { ok: false, error: "Admin rights are required to do that." };
  }
  return result;
}

export function canEdit(
  item: { authorId: string },
  user: { id: string; role: Role },
): boolean {
  return item.authorId === user.id || user.role === "admin" || user.role === "owner";
}
