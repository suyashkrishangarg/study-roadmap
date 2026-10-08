"use server";

import { prisma } from "@/lib/db";
import { requireAdmin, type ActionResult } from "@/lib/authz";
import type { Role } from "@prisma/client";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
  _count: {
    authoredTasks: number;
    checkIns: number;
    quizzes: number;
  };
};

export async function listWorkspaceUsers(): Promise<ActionResult<AdminUserRow[]>> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };

  const users = await prisma.user.findMany({
    where: { workspaceId: admin.user.workspaceId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { authoredTasks: true, checkIns: true, quizzes: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return { ok: true, data: users };
}

const ASSIGNABLE_ROLES: Role[] = ["admin", "member"];

export async function setUserRole(
  userId: string,
  role: Role,
): Promise<ActionResult<{ id: string; role: Role }>> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { ok: false, error: "Only admin or member can be assigned here. Ownership stays with the workspace owner." };
  }
  if (userId === admin.user.id) {
    return { ok: false, error: "You can't change your own role." };
  }

  const existing = await prisma.user.findFirst({
    where: { id: userId, workspaceId: admin.user.workspaceId },
    select: { id: true, role: true },
  });
  if (!existing) return { ok: false, error: "User not found in this workspace." };
  if (existing.role === "owner") {
    return { ok: false, error: "The workspace owner's role can't be changed." };
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, role: true },
  });
  return { ok: true, data: updated };
}

export async function removeUserFromWorkspace(
  userId: string,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };

  if (userId === admin.user.id) {
    return { ok: false, error: "You can't remove yourself from the workspace." };
  }

  const existing = await prisma.user.findFirst({
    where: { id: userId, workspaceId: admin.user.workspaceId },
    select: { id: true, role: true },
  });
  if (!existing) return { ok: false, error: "User not found in this workspace." };
  if (existing.role === "owner") {
    return { ok: false, error: "The workspace owner can't be removed." };
  }

  // Detach: authored content stays (authoredTasks/Roadmaps keep history),
  // assignments are cleared so nothing points at an outsider.
  await prisma.$transaction([
    prisma.task.updateMany({
      where: { assigneeId: userId },
      data: { assigneeId: null },
    }),
    prisma.roadmapItem.updateMany({
      where: { assigneeId: userId },
      data: { assigneeId: null },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { workspaceId: null },
    }),
  ]);
  return { ok: true, data: { id: userId } };
}

export async function deleteUserCompletely(
  userId: string,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };

  if (userId === admin.user.id) {
    return { ok: false, error: "You can't delete your own account." };
  }

  const existing = await prisma.user.findFirst({
    where: { id: userId, workspaceId: admin.user.workspaceId },
    select: { id: true, role: true },
  });
  if (!existing) return { ok: false, error: "User not found in this workspace." };
  if (existing.role === "owner") {
    return { ok: false, error: "The workspace owner can't be deleted." };
  }

  // Full cascade: tasks/roadmaps/check-ins/goals/quizzes/flashcards/notifications
  // all cascade from User or Workspace per the Prisma schema.
  await prisma.user.delete({ where: { id: userId } });
  return { ok: true, data: { id: userId } };
}
