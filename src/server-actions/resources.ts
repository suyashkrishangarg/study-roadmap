"use server";

import { prisma } from "@/lib/db";
import { requireMember, type ActionResult } from "@/lib/authz";
import type { Resource } from "@prisma/client";

/** Toggle a resource's favorite flag (shared workspace-level). */
export async function toggleFavorite(
  id: string,
): Promise<ActionResult<Resource>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const resource = await prisma.resource.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { id: true, favorite: true },
  });
  if (!resource) return { ok: false, error: "Resource not found." };

  const updated = await prisma.resource.update({
    where: { id },
    data: { favorite: !resource.favorite },
  });
  return { ok: true, data: updated };
}

/**
 * Attach a library resource to a roadmap item as a ResourceLink.
 * Enforces the same 10-link-per-item cap as manual links.
 */
export async function attachResourceToItem(
  resourceId: string,
  roadmapItemId: string,
): Promise<ActionResult<{ id: string }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const [resource, item] = await Promise.all([
    prisma.resource.findFirst({
      where: { id: resourceId, workspaceId: member.user.workspaceId },
      select: { id: true, title: true, url: true },
    }),
    prisma.roadmapItem.findFirst({
      where: { id: roadmapItemId, roadmap: { workspaceId: member.user.workspaceId } },
      select: { id: true },
    }),
  ]);
  if (!resource) return { ok: false, error: "Resource not found." };
  if (!item) return { ok: false, error: "Roadmap item not found in this workspace." };

  const existing = await prisma.resourceLink.findMany({
    where: { roadmapItemId },
    select: { id: true, url: true },
    orderBy: { sortOrder: "asc" },
  });
  if (existing.length >= 10) {
    return { ok: false, error: "At most 10 resource links per item." };
  }
  if (existing.some((l) => l.url === resource.url)) {
    return { ok: false, error: "That resource is already linked to this item." };
  }

  const created = await prisma.resourceLink.create({
    data: {
      title: resource.title.slice(0, 120),
      url: resource.url,
      sortOrder: existing.length,
      roadmapItemId,
    },
  });
  return { ok: true, data: { id: created.id } };
}
