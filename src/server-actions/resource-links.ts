"use server";

import { prisma } from "@/lib/db";
import { requireMember, type ActionResult } from "@/lib/authz";
import { validateLinks, linkCreateManyData } from "@/lib/resource-links";
import type { ResourceLink } from "@prisma/client";

async function taskInWorkspace(taskId: string, workspaceId: string) {
  return prisma.task.findFirst({
    where: { id: taskId, workspaceId },
    select: { id: true },
  });
}

async function itemInWorkspace(itemId: string, workspaceId: string) {
  return prisma.roadmapItem.findFirst({
    where: { id: itemId, roadmap: { workspaceId } },
    select: { id: true },
  });
}

export async function addTaskLinks(
  taskId: string,
  links: { title: string; url: string }[],
): Promise<ActionResult<ResourceLink[]>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const task = await taskInWorkspace(taskId, member.user.workspaceId);
  if (!task) return { ok: false, error: "Task not found." };

  const checked = validateLinks(links);
  if (!checked.ok) return { ok: false, error: checked.error };
  if (checked.links.length === 0) {
    return { ok: false, error: "Add at least one link." };
  }

  const existing = await prisma.resourceLink.count({ where: { taskId } });
  if (existing + checked.links.length > 10) {
    return { ok: false, error: "At most 10 resource links per task." };
  }

  await prisma.resourceLink.createMany({
    data: linkCreateManyData(checked.links).map((l, i) => ({
      ...l,
      sortOrder: existing + i,
      taskId,
    })),
  });
  const all = await prisma.resourceLink.findMany({
    where: { taskId },
    orderBy: { sortOrder: "asc" },
  });
  return { ok: true, data: all };
}

export async function removeTaskLink(
  taskId: string,
  linkId: string,
): Promise<ActionResult<ResourceLink[]>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const task = await taskInWorkspace(taskId, member.user.workspaceId);
  if (!task) return { ok: false, error: "Task not found." };

  const existing = await prisma.resourceLink.findFirst({
    where: { id: linkId, taskId },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Link not found." };

  await prisma.resourceLink.delete({ where: { id: linkId } });
  const all = await prisma.resourceLink.findMany({
    where: { taskId },
    orderBy: { sortOrder: "asc" },
  });
  return { ok: true, data: all };
}

export async function addRoadmapItemLinks(
  itemId: string,
  links: { title: string; url: string }[],
): Promise<ActionResult<ResourceLink[]>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const item = await itemInWorkspace(itemId, member.user.workspaceId);
  if (!item) return { ok: false, error: "Roadmap item not found." };

  const checked = validateLinks(links);
  if (!checked.ok) return { ok: false, error: checked.error };
  if (checked.links.length === 0) {
    return { ok: false, error: "Add at least one link." };
  }

  const existing = await prisma.resourceLink.count({
    where: { roadmapItemId: itemId },
  });
  if (existing + checked.links.length > 10) {
    return { ok: false, error: "At most 10 resource links per item." };
  }

  await prisma.resourceLink.createMany({
    data: linkCreateManyData(checked.links).map((l, i) => ({
      ...l,
      sortOrder: existing + i,
      roadmapItemId: itemId,
    })),
  });
  const all = await prisma.resourceLink.findMany({
    where: { roadmapItemId: itemId },
    orderBy: { sortOrder: "asc" },
  });
  return { ok: true, data: all };
}

export async function removeRoadmapItemLink(
  itemId: string,
  linkId: string,
): Promise<ActionResult<ResourceLink[]>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const item = await itemInWorkspace(itemId, member.user.workspaceId);
  if (!item) return { ok: false, error: "Roadmap item not found." };

  const existing = await prisma.resourceLink.findFirst({
    where: { id: linkId, roadmapItemId: itemId },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Link not found." };

  await prisma.resourceLink.delete({ where: { id: linkId } });
  const all = await prisma.resourceLink.findMany({
    where: { roadmapItemId: itemId },
    orderBy: { sortOrder: "asc" },
  });
  return { ok: true, data: all };
}
