import { auth } from "@/lib/auth";
import { decryptProviderKey, getEnabledProviders } from "@/lib/ai-providers";
import { STATIC_GOOGLE, type ModelEntry } from "@/lib/ai-models";

export const maxDuration = 30;

// 60s in-memory cache: the picker fires this per keystroke otherwise.
let cache: { at: number; models: ModelEntry[] } | null = null;

async function fetchOpenAiModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const url = `${baseUrl.replace(/\/+$/, "")}/models`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { data?: { id?: string }[] };
  const ids = (json.data ?? []).map((m) => m?.id).filter(Boolean) as string[];
  return ids;
}

async function fetchGoogleModels(): Promise<string[]> {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return [];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { models?: { name?: string }[] };
  return (json.models ?? [])
    .map((m) => m?.name?.replace(/^models\//, ""))
    .filter(Boolean) as string[];
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.workspaceId) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (cache && Date.now() - cache.at < 60_000) {
    return Response.json({ models: cache.models, cached: true });
  }

  const models: ModelEntry[] = [...STATIC_GOOGLE];
  const seen = new Set(models.map((m) => m.id));

  // Live Google list (falls back to static entries when the key is missing).
  try {
    const live = await fetchGoogleModels();
    for (const id of live) {
      const namespaced = `google:${id}`;
      if (seen.has(namespaced)) continue;
      seen.add(namespaced);
      models.push({ id: namespaced, label: id, hint: "Google · Live" });
    }
  } catch {
    // static entries already cover Google; never fail the picker
  }

  // Workspace-configured OpenAI-compatible providers.
  const providers = await getEnabledProviders();
  for (const p of providers) {
    try {
      const key = decryptProviderKey(p.apiKeyEnc);
      const ids = p.baseUrl.includes("generativelanguage.googleapis.com")
        ? await fetchGoogleModels()
        : await fetchOpenAiModels(p.baseUrl, key);
      for (const id of ids.slice(0, 200)) {
        const namespaced = `${p.id}:${id}`;
        if (seen.has(namespaced)) continue;
        seen.add(namespaced);
        models.push({ id: namespaced, label: id, hint: `${p.name} · Live` });
      }
    } catch {
      // One dead provider must not hide the rest.
      continue;
    }
  }

  cache = { at: Date.now(), models };
  return Response.json({ models, cached: false });
}
