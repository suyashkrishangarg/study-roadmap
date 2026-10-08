"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { encryptProviderKey } from "@/lib/ai-providers";

function cleanBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

function validBaseUrl(raw: string): boolean {
  try {
    const u = new URL(cleanBaseUrl(raw));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createProvider(input: {
  name: string;
  baseUrl: string;
  apiKey: string;
}) {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false as const, error: admin.error };

  const name = input.name.trim().slice(0, 80);
  if (!name) return { ok: false as const, error: "Give the provider a name." };
  if (!validBaseUrl(input.baseUrl)) {
    return { ok: false as const, error: "Base URL must start with http(s) — e.g. https://api.openai.com/v1." };
  }
  if (!input.apiKey.trim()) {
    return { ok: false as const, error: "API key is required — it is stored encrypted." };
  }

  const row = await prisma.aiProvider.create({
    data: {
      name,
      baseUrl: cleanBaseUrl(input.baseUrl),
      apiKeyEnc: encryptProviderKey(input.apiKey.trim()),
      workspaceId: admin.user.workspaceId,
    },
  });
  return { ok: true as const, data: { id: row.id } };
}

export async function updateProvider(
  id: string,
  input: { name?: string; baseUrl?: string; apiKey?: string; enabled?: boolean },
) {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false as const, error: admin.error };

  const existing = await prisma.aiProvider.findFirst({
    where: { id, workspaceId: admin.user.workspaceId },
  });
  if (!existing) return { ok: false as const, error: "Provider not found." };

  const data: { name?: string; baseUrl?: string; apiKeyEnc?: string; enabled?: boolean } = {};
  if (input.name !== undefined) {
    const name = input.name.trim().slice(0, 80);
    if (!name) return { ok: false as const, error: "Give the provider a name." };
    data.name = name;
  }
  if (input.baseUrl !== undefined) {
    if (!validBaseUrl(input.baseUrl)) {
      return { ok: false as const, error: "Base URL must start with http(s)." };
    }
    data.baseUrl = cleanBaseUrl(input.baseUrl);
  }
  if (input.apiKey !== undefined && input.apiKey.trim()) {
    data.apiKeyEnc = encryptProviderKey(input.apiKey.trim());
  }
  if (input.enabled !== undefined) data.enabled = input.enabled;

  await prisma.aiProvider.update({ where: { id }, data });
  return { ok: true as const, data: { id } };
}

export async function deleteProvider(id: string) {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false as const, error: admin.error };

  const existing = await prisma.aiProvider.findFirst({
    where: { id, workspaceId: admin.user.workspaceId },
    select: { id: true },
  });
  if (!existing) return { ok: false as const, error: "Provider not found." };

  await prisma.aiProvider.delete({ where: { id } });
  return { ok: true as const, data: { id } };
}
