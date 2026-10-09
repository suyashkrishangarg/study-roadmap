"use server";

import { prisma } from "@/lib/db";
import { requireMember, type ActionResult } from "@/lib/authz";
import type { Project } from "@prisma/client";

/** Toggle a project's favorite flag (shared workspace-level). */
export async function toggleFavoriteProject(
  id: string,
): Promise<ActionResult<Project>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const project = await prisma.project.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { id: true, favorite: true },
  });
  if (!project) return { ok: false, error: "Project not found." };

  const updated = await prisma.project.update({
    where: { id },
    data: { favorite: !project.favorite },
  });
  return { ok: true, data: updated };
}

/**
 * Create a task to build a project (so it can be tracked like any other task).
 * Skips if an equivalent open task already exists for this project.
 */
export async function createTaskFromProject(
  projectId: string,
  dueDate?: Date | null,
): Promise<ActionResult<{ id: string; alreadyExisted?: boolean }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: member.user.workspaceId },
    select: { id: true, title: true, description: true, category: true },
  });
  if (!project) return { ok: false, error: "Project not found." };

  const taskTitle = `Build: ${project.title}`;
  const existing = await prisma.task.findFirst({
    where: {
      workspaceId: member.user.workspaceId,
      title: taskTitle,
      status: { not: "done" },
    },
    select: { id: true },
  });
  if (existing) {
    return { ok: true, data: { id: existing.id, alreadyExisted: true } };
  }

  const notes = project.description
    ? `${project.description}\n\nCategory: ${project.category}`
    : `Category: ${project.category}`;

  const task = await prisma.task.create({
    data: {
      title: taskTitle,
      notes,
      priority: "medium",
      status: "todo",
      dueDate: dueDate ?? null,
      authorId: member.user.id,
      workspaceId: member.user.workspaceId,
    },
    select: { id: true },
  });
  return { ok: true, data: { id: task.id } };
}
