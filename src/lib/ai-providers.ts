import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/authz";

function providerKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return scryptSync(secret, "ai-provider-key", 32);
}

export function encryptProviderKey(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", providerKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${enc.toString("base64url")}.${tag.toString("base64url")}`;
}

export function decryptProviderKey(payload: string): string {
  const [ivB64, encB64, tagB64] = payload.split(".");
  if (!ivB64 || !encB64 || !tagB64) throw new Error("Bad provider key payload");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    providerKey(),
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(encB64, "base64url")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export type ProviderSafe = {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  hasKey: boolean;
  updatedAt: Date;
};

export async function listProviders(): Promise<ProviderSafe[]> {
  const member = await requireMember();
  if (!member.ok) return [];
  const rows = await prisma.aiProvider.findMany({
    where: { workspaceId: member.user.workspaceId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    baseUrl: r.baseUrl,
    enabled: r.enabled,
    hasKey: r.apiKeyEnc.length > 0,
    updatedAt: r.updatedAt,
  }));
}

export async function getEnabledProviders() {
  const member = await requireMember();
  if (!member.ok) return [];
  return prisma.aiProvider.findMany({
    where: { workspaceId: member.user.workspaceId, enabled: true },
    orderBy: { createdAt: "asc" },
  });
}
