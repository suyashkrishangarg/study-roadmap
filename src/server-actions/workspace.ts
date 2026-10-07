"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { generateInviteCode } from "@/lib/invite-code";

export async function joinWorkspace(
  code: string,
): Promise<
  | { ok: true; data: { workspaceId: string } }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to join." };
  }

  const workspace = await prisma.workspace.findFirst({
    where: { inviteCode: code.trim().toUpperCase() },
    select: { id: true },
  });

  if (!workspace) {
    return { ok: false, error: "That invite code is not valid." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { workspaceId: workspace.id },
  });

  return { ok: true, data: { workspaceId: workspace.id } };
}

export async function regenerateInviteCode(): Promise<
  | { ok: true; data: { inviteCode: string } }
  | { ok: false; error: string }
> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };

  const workspace = await prisma.workspace.update({
    where: { id: admin.user.workspaceId },
    data: { inviteCode: generateInviteCode() },
    select: { inviteCode: true },
  });

  return { ok: true, data: { inviteCode: workspace.inviteCode } };
}

export async function getInviteCode(): Promise<
  | { ok: true; data: { inviteCode: string } }
  | { ok: false; error: string }
> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };

  const workspace = await prisma.workspace.findUnique({
    where: { id: admin.user.workspaceId },
    select: { inviteCode: true },
  });

  if (!workspace) {
    return { ok: false, error: "Workspace not found." };
  }

  return { ok: true, data: { inviteCode: workspace.inviteCode } };
}
