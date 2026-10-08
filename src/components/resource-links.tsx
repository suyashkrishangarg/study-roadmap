"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  Link as LinkIcon,
  Plus,
  Trash,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResourceLink } from "@prisma/client";

export function ResourceLinks({
  links,
  onAdd,
  onRemove,
  compact,
}: {
  links: Pick<ResourceLink, "id" | "title" | "url">[];
  onAdd: (links: { title: string; url: string }[]) => Promise<{ ok: boolean; error?: string }>;
  onRemove: (linkId: string) => Promise<{ ok: boolean; error?: string }>;
  compact?: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await onAdd([{ title: title.trim(), url: url.trim() }]);
    setPending(false);
    if (result.ok) {
      setTitle("");
      setUrl("");
      setAdding(false);
      router.refresh();
    } else {
      setError(result.error ?? "Could not add link.");
    }
  }

  async function handleRemove(linkId: string) {
    setRemovingId(linkId);
    const result = await onRemove(linkId);
    setRemovingId(null);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error ?? "Could not remove link.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {links.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {links.map((link) => (
            <li key={link.id} className="group flex items-center gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <LinkIcon size={14} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{link.title}</span>
                <ArrowSquareOut size={13} strokeWidth={1.5} aria-hidden="true" className="shrink-0 opacity-60" />
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => void handleRemove(link.id)}
                disabled={removingId === link.id}
                aria-label={`Remove link ${link.title}`}
                className={compact ? "h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100" : "h-6 w-6"}
              >
                <Trash size={13} strokeWidth={1.5} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-2.5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`link-title-${links.length}`}>Title</Label>
            <Input
              id={`link-title-${links.length}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 5 video"
              maxLength={120}
              required
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`link-url-${links.length}`}>URL</Label>
            <Input
              id={`link-url-${links.length}`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="youtube.com/… or paste full link"
              maxLength={2048}
              required
              autoComplete="off"
              inputMode="url"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Adding…" : "Add link"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          {links.length < 10 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAdding(true)}
              className="w-fit px-1 text-xs text-muted-foreground"
            >
              <Plus size={13} strokeWidth={1.5} aria-hidden="true" />
              Add resource link
            </Button>
          )}
        </>
      )}
    </div>
  );
}
