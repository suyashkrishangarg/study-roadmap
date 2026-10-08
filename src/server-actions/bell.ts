"use server";

import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/authz";

export async function getBellNotifications() {
  const member = await requireMember();
  if (!member.ok) return { ok: false as const, error: member.error };
  const rows = await prisma.notification.findMany({
    where: { userId: member.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return { ok: true as const, data: rows };
}
