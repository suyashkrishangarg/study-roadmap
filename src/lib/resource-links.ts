import type { Prisma } from "@prisma/client";

export type ResourceLinkInput = { title: string; url: string };

const MAX_LINKS = 10;
const MAX_TITLE = 120;
const MAX_URL = 2048;

export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_URL) return null;
  if (/[\s<>]/.test(trimmed)) return null;
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!parsed.hostname || !parsed.hostname.includes(".")) return null;
  return parsed.toString();
}

export function validateLinks(
  links: unknown,
): { ok: true; links: ResourceLinkInput[] } | { ok: false; error: string } {
  if (links === undefined) return { ok: true, links: [] };
  if (!Array.isArray(links)) {
    return { ok: false, error: "Resource links must be a list." };
  }
  if (links.length > MAX_LINKS) {
    return { ok: false, error: `At most ${MAX_LINKS} resource links allowed.` };
  }
  const out: ResourceLinkInput[] = [];
  const seen = new Set<string>();
  for (const entry of links) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, error: "Each resource link needs a title and URL." };
    }
    const { title, url } = entry as { title?: unknown; url?: unknown };
    if (typeof title !== "string" || !title.trim()) {
      return { ok: false, error: "Each resource link needs a title." };
    }
    if (title.trim().length > MAX_TITLE) {
      return {
        ok: false,
        error: `Link titles must be ${MAX_TITLE} characters or less.`,
      };
    }
    if (typeof url !== "string" || !url.trim()) {
      return { ok: false, error: "Each resource link needs a URL." };
    }
    const normalized = normalizeUrl(url);
    if (!normalized) {
      return {
        ok: false,
        error: `"${url.trim().slice(0, 60)}" is not a valid http(s) URL.`,
      };
    }
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push({ title: title.trim(), url: normalized });
  }
  return { ok: true, links: out };
}

export function linkCreateManyData(
  links: ResourceLinkInput[],
): Prisma.ResourceLinkCreateManyInput[] {
  return links.map((link, i) => ({
    title: link.title,
    url: link.url,
    sortOrder: i,
  }));
}
