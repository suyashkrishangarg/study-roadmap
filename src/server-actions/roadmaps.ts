"use server";

import { prisma } from "@/lib/db";
import { canEdit, requireMember, type ActionResult } from "@/lib/authz";
import type { Roadmap, RoadmapItem, RoadmapItemStatus } from "@prisma/client";

export async function createRoadmap(input: {
  title: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  color?: string | null;
}): Promise<ActionResult<Roadmap>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (title.length > 160) return { ok: false, error: "Title is too long (max 160 characters)." };

  const roadmap = await prisma.roadmap.create({
    data: {
      title,
      description: input.description?.trim() || null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      color: input.color ?? null,
      authorId: member.user.id,
      workspaceId: member.user.workspaceId,
    },
  });

  return { ok: true, data: roadmap };
}

export async function updateRoadmap(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    color?: string | null;
  },
): Promise<ActionResult<Roadmap>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.roadmap.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Roadmap not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't edit this roadmap." };
  }

  const data: Parameters<typeof prisma.roadmap.update>[0]["data"] = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) return { ok: false, error: "Title is required." };
    if (title.length > 160) return { ok: false, error: "Title is too long (max 160 characters)." };
    data.title = title;
  }
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.startDate !== undefined) data.startDate = input.startDate;
  if (input.endDate !== undefined) data.endDate = input.endDate;
  if (input.color !== undefined) data.color = input.color;

  const updated = await prisma.roadmap.update({ where: { id }, data });
  return { ok: true, data: updated };
}

export async function deleteRoadmap(id: string): Promise<ActionResult<{ id: string }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.roadmap.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Roadmap not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't delete this roadmap." };
  }

  await prisma.roadmap.delete({ where: { id } });
  return { ok: true, data: { id } };
}

export async function createRoadmapItem(
  roadmapId: string,
  input: {
    title: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    assigneeId?: string | null;
  },
): Promise<ActionResult<RoadmapItem>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (title.length > 200) return { ok: false, error: "Title is too long (max 200 characters)." };

  const roadmap = await prisma.roadmap.findFirst({
    where: { id: roadmapId, workspaceId: member.user.workspaceId },
    select: { id: true },
  });
  if (!roadmap) return { ok: false, error: "Roadmap not found." };

  const assigneeId = input.assigneeId || null;
  if (assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: { id: assigneeId, workspaceId: member.user.workspaceId },
      select: { id: true },
    });
    if (!assignee) return { ok: false, error: "Assignee must be a workspace member." };
  }

  const sortOrder = await prisma.roadmapItem.count({ where: { roadmapId } });

  const item = await prisma.roadmapItem.create({
    data: {
      title,
      description: input.description?.trim() || null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      assigneeId,
      authorId: member.user.id,
      roadmapId,
      sortOrder,
    },
  });

  return { ok: true, data: item };
}

export async function updateRoadmapItem(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    status?: RoadmapItemStatus;
    progress?: number;
    startDate?: Date | null;
    endDate?: Date | null;
    assigneeId?: string | null;
  },
): Promise<ActionResult<RoadmapItem>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.roadmapItem.findFirst({
    where: { id, roadmap: { workspaceId: member.user.workspaceId } },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Roadmap item not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't edit this roadmap item." };
  }

  const data: Parameters<typeof prisma.roadmapItem.update>[0]["data"] = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) return { ok: false, error: "Title is required." };
    if (title.length > 200) return { ok: false, error: "Title is too long (max 200 characters)." };
    data.title = title;
  }
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.status !== undefined) data.status = input.status;
  if (input.progress !== undefined) {
    data.progress = Math.max(0, Math.min(100, Math.round(input.progress)));
  }
  if (input.startDate !== undefined) data.startDate = input.startDate;
  if (input.endDate !== undefined) data.endDate = input.endDate;
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

  const updated = await prisma.roadmapItem.update({ where: { id }, data });
  return { ok: true, data: updated };
}

export async function deleteRoadmapItem(id: string): Promise<ActionResult<{ id: string }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.roadmapItem.findFirst({
    where: { id, roadmap: { workspaceId: member.user.workspaceId } },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Roadmap item not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't delete this roadmap item." };
  }

  await prisma.roadmapItem.delete({ where: { id } });
  return { ok: true, data: { id } };
}
