"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleFavorite,
  attachResourceToItem,
} from "@/server-actions/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  FilmSlate,
  Globe,
  Link as LinkIcon,
  MonitorPlay,
  Star,
  Users,
} from "@phosphor-icons/react/ssr";
import type { Resource, ResourceLevel, ResourceType } from "@prisma/client";

export type ResourceGroupCount = { group: string; count: number };
export type RoadmapOption = {
  id: string;
  title: string;
  items: { id: string; title: string }[];
};
export type ResourceFilters = {
  group?: string;
  level?: ResourceLevel;
  type?: ResourceType;
  search?: string;
  favoritesOnly?: boolean;
};

const TYPE_ICON: Record<ResourceType, typeof Globe> = {
  video: FilmSlate,
  playlist: MonitorPlay,
  website: Globe,
  channel: Users,
  link: LinkIcon,
};

const LEVEL_STYLE: Record<ResourceLevel, string> = {
  Beginner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Advanced: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function formatDuration(min: number | null): string | null {
  if (!min || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function AttachDialog({
  open,
  onOpenChange,
  resource,
  roadmapOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
  roadmapOptions: RoadmapOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [roadmapId, setRoadmapId] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const roadmap = roadmapOptions.find((r) => r.id === roadmapId);
  const items = roadmap?.items ?? [];

  function reset() {
    setRoadmapId("");
    setItemId("");
    setError(null);
    setDone(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function attach() {
    if (!resource || !itemId) return;
    setError(null);
    startTransition(async () => {
      const result = await attachResourceToItem(resource.id, itemId);
      if (result.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach resource</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {resource?.title}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
            Linked. Open the roadmap item to see it.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="attach-roadmap">
                Roadmap
              </label>
              <Select
                value={roadmapId}
                onValueChange={(v) => {
                  setRoadmapId(v);
                  setItemId("");
                }}
              >
                <SelectTrigger id="attach-roadmap">
                  <SelectValue placeholder="Choose a roadmap" />
                </SelectTrigger>
                <SelectContent>
                  {roadmapOptions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="attach-item">
                Item
              </label>
              <Select value={itemId} onValueChange={setItemId} disabled={!roadmapId}>
                <SelectTrigger id="attach-item">
                  <SelectValue placeholder={roadmapId ? "Choose an item" : "Pick a roadmap first"} />
                </SelectTrigger>
                <SelectContent>
                  {items.map((it) => (
                    <SelectItem key={it.id} value={it.id}>
                      {it.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {done ? (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={attach} disabled={!itemId || pending}>
                {pending ? "Linking…" : "Attach"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResourceCard({
  resource,
  onAttach,
}: {
  resource: Resource;
  onAttach: (r: Resource) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const Icon = TYPE_ICON[resource.type] ?? Globe;
  const dur = formatDuration(resource.durationMin);

  function toggle() {
    startTransition(async () => {
      await toggleFavorite(resource.id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-muted-foreground" />
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer noopener"
            className="truncate text-sm font-medium hover:underline"
            title={resource.title}
          >
            {resource.title}
          </a>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-label={resource.favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={resource.favorite}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-amber-500"
        >
          <Star
            size={16}
            strokeWidth={1.5}
            weight={resource.favorite ? "fill" : "regular"}
            className={resource.favorite ? "text-amber-500" : ""}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={LEVEL_STYLE[resource.level]}>
          {resource.level}
        </Badge>
        <Badge variant="secondary" className="capitalize">
          {resource.type}
        </Badge>
        {dur && <span className="text-xs text-muted-foreground">{dur}</span>}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted-foreground" title={resource.group}>
          {resource.group}
        </span>
        <Button variant="ghost" size="xs" onClick={() => onAttach(resource)}>
          <LinkIcon size={14} strokeWidth={1.5} aria-hidden="true" />
          Attach
        </Button>
      </div>
    </div>
  );
}

const LEVEL_OPTIONS = ["all", "Beginner", "Intermediate", "Advanced"] as const;
const TYPE_OPTIONS = ["all", "video", "playlist", "website", "channel", "link"] as const;

export function ResourcesPageClient({
  resources,
  groups,
  roadmapOptions,
  filters,
}: {
  resources: Resource[];
  groups: ResourceGroupCount[];
  roadmapOptions: RoadmapOption[];
  filters: ResourceFilters;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search ?? "");
  const [attachTarget, setAttachTarget] = useState<Resource | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);

  const totalCount = useMemo(() => groups.reduce((s, g) => s + g.count, 0), [groups]);

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`/resources?${params.toString()}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", search.trim() || undefined);
  }

  function toggleFavorites() {
    const params = new URLSearchParams(window.location.search);
    if (filters.favoritesOnly) params.delete("fav");
    else params.set("fav", "1");
    router.push(`/resources?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl">Resources</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Your full library — {totalCount} curated courses, videos, docs and
            papers. Favorite the keepers and attach any of them to a roadmap item.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <form onSubmit={submitSearch} className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, source, or group…"
            aria-label="Search resources"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.group ?? "all"} onValueChange={(v) => updateParam("group", v)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups ({totalCount})</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.group} value={g.group}>
                  {g.group} ({g.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.level ?? "all"} onValueChange={(v) => updateParam("level", v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Any level" />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l === "all" ? "Any level" : l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.type ?? "all"} onValueChange={(v) => updateParam("type", v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "Any type" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={filters.favoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={toggleFavorites}
            aria-pressed={filters.favoritesOnly}
          >
            <Star size={14} strokeWidth={1.5} weight={filters.favoritesOnly ? "fill" : "regular"} aria-hidden="true" />
            Favorites
          </Button>

          <span className="ml-auto text-sm text-muted-foreground">
            {resources.length} shown
          </span>
        </div>
      </div>

      {/* Grid */}
      {resources.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen size={24} strokeWidth={1.5} aria-hidden="true" className="text-muted-foreground" />
          <p className="text-sm font-medium">No resources match these filters.</p>
          <p className="text-sm text-muted-foreground">Try clearing the search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              onAttach={(res) => {
                setAttachTarget(res);
                setAttachOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <AttachDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        resource={attachTarget}
        roadmapOptions={roadmapOptions}
      />
    </div>
  );
}



