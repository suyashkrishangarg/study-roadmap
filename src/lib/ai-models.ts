import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { decryptProviderKey } from "@/lib/ai-providers";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/authz";

/** Bare Gemini id from before the provider hub (kept working). */
export const LEGACY_DEFAULT_MODEL = "gemini-flash-lite-latest";
/** Namespaced default: google:<model>. */
export const DEFAULT_MODEL_ID = "google:gemini-flash-lite-latest";

export type ModelEntry = { id: string; label: string; hint: string };

export const STATIC_GOOGLE: ModelEntry[] = [
  { id: "google:gemini-flash-lite-latest", label: "Flash Lite", hint: "Google · Fastest · auto-updates" },
  { id: "google:gemini-flash-latest", label: "Flash", hint: "Google · Smart · auto-updates" },
  { id: "google:gemini-2.5-flash-lite", label: "Flash Lite 2.5", hint: "Google · Pinned fallback" },
];

/** Accepts new namespaced ids (provider:model) plus legacy bare gemini ids. */
export function normalizeModelId(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return DEFAULT_MODEL_ID;
  if (value.includes(":")) return value;
  return `google:${value}`;
}

export function isModelId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length < 200;
}

export type ResolvedModel =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { ok: true; model: any; id: string }
  | { ok: false; error: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function resolveModel(modelId: string): Promise<ResolvedModel> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const idx = modelId.indexOf(":");
  const providerId = idx === -1 ? "google" : modelId.slice(0, idx);
  const modelName = idx === -1 ? modelId : modelId.slice(idx + 1);
  if (!modelName) return { ok: false, error: "Pick a model first." };

  if (providerId === "google") {
    return { ok: true, model: google(modelName) as never, id: modelId };
  }

  const provider = await prisma.aiProvider.findFirst({
    where: { id: providerId, workspaceId: member.user.workspaceId, enabled: true },
  });
  if (!provider) return { ok: false, error: "That model provider is not configured." };
  const baseURL = provider.baseUrl.replace(/\/+$/, "");
  // Gemini uses the Google provider (not OpenAI-compatible); everything else
  // goes through the OpenAI-compatible chat + /models endpoints.
  if (baseURL.includes("generativelanguage.googleapis.com")) {
    return { ok: true, model: google(modelName) as any, id: modelId };
  }
  try {
    const key = decryptProviderKey(provider.apiKeyEnc);
    const custom = createOpenAICompatible({
      name: provider.name,
      baseURL,
      apiKey: key,
    });
    return { ok: true, model: custom.chatModel(modelName) as any, id: modelId };
  } catch {
    return { ok: false, error: "Could not unlock that provider's API key." };
  }
}
