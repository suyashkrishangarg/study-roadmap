"use server";

import { prisma } from "@/lib/db";
import { canEdit, requireMember, type ActionResult } from "@/lib/authz";
import type { Priority, Task, TaskStatus } from "@prisma/client";

export async function createTask(input: {
  title: string;
  notes?: string | null;
  priority?: Priority;
  dueDate?: Date | null;
  assigneeId?: string | null;
  roadmapItemId?: string | null;
}): Promise<ActionResult<Task>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (title.length > 200) return { ok: false, error: "Title is too long (max 200 characters)." };

  const assigneeId = input.assigneeId || null;
  if (assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: { id: assigneeId, workspaceId: member.user.workspaceId },
      select: { id: true },
    });
    if (!assignee) return { ok: false, error: "Assignee must be a workspace member." };
  }

  const roadmapItemId = input.roadmapItemId || null;
  if (roadmapItemId) {
    const item = await prisma.roadmapItem.findFirst({
      where: { id: roadmapItemId, roadmap: { workspaceId: member.user.workspaceId } },
      select: { id: true },
    });
    if (!item) return { ok: false, error: "Roadmap item not found in this workspace." };
  }

  const task = await prisma.task.create({
    data: {
      title,
      notes: input.notes?.trim() || null,
      priority: input.priority ?? "medium",
      dueDate: input.dueDate ?? null,
      assigneeId,
      roadmapItemId,
      authorId: member.user.id,
      workspaceId: member.user.workspaceId,
      status: "todo",
    },
  });

  return { ok: true, data: task };
}

export async function updateTask(
  id: string,
  input: {
    title?: string;
    notes?: string | null;
    priority?: Priority;
    status?: TaskStatus;
    dueDate?: Date | null;
    assigneeId?: string | null;
  },
): Promise<ActionResult<Task>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.task.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Task not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't edit this task." };
  }

  const data: Parameters<typeof prisma.task.update>[0]["data"] = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) return { ok: false, error: "Title is required." };
    if (title.length > 200) return { ok: false, error: "Title is too long (max 200 characters)." };
    data.title = title;
  }
  if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.status !== undefined) {
    data.status = input.status;
    data.completedAt = input.status === "done" ? new Date() : null;
  }
  if (input.dueDate !== undefined) data.dueDate = input.dueDate;
  if (input.assigneeId !== undefined) {
    const assigneeId = input.assigneeId || null;
    if (assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: { id: assigneeId, workspaceId: member.user.workspaceId },
        select: { id: true },
      });
      if (!assignee) return { ok: false, error: "Assignee must be a workspace member." };
    }
    data.assigneeId = assigneeId;
  }

  const updated = await prisma.task.update({ where: { id }, data });
  return { ok: true, data: updated };
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<ActionResult<Task>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.task.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Task not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't edit this task." };
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { status, completedAt: status === "done" ? new Date() : null },
  });
  return { ok: true, data: updated };
}

export async function deleteTask(id: string): Promise<ActionResult<{ id: string }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.task.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Task not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't delete this task." };
  }

  await prisma.task.delete({ where: { id } });
  return { ok: true, data: { id } };
}
