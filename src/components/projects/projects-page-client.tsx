"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleFavoriteProject,
  createTaskFromProject,
} from "@/server-actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClampedText } from "@/components/clamped-text";
import { Rocket, Star, ListPlus } from "@phosphor-icons/react/ssr";
import type { Project } from "@prisma/client";

export type ProjectCategoryCount = { category: string; count: number };
export type ProjectFilters = {
  category?: string;
  search?: string;
  favoritesOnly?: boolean;
};

const CATEGORY_ORDER = [
  "DSA / Python",
  "Classical ML",
  "Reinforcement Learning",
  "LLM Systems",
];

const CATEGORY_BADGE: Record<string, string> = {
  "DSA / Python": "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "Classical ML": "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "Reinforcement Learning": "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "LLM Systems": "border-pink-500/30 bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

function priorityBadge(priority: string | null) {
  if (priority === "Core") return <Badge variant="destructive">Core</Badge>;
  if (priority === "Important") return <Badge variant="secondary">Important</Badge>;
  return null;
}

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const [favPending, startFav] = useTransition();
  const [taskPending, startTask] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  function toggleFav() {
    startFav(async () => {
      await toggleFavoriteProject(project.id);
      router.refresh();
    });
  }

  function addTask() {
    setNote(null);
    startTask(async () => {
      const result = await createTaskFromProject(project.id);
      if (result.ok) {
        setNote(result.data.alreadyExisted ? "Already on your tasks." : "Added to tasks.");
        router.refresh();
      } else {
        setNote(result.error);
      }
    });
  }

  const meta = [
    project.estHours ? `~${project.estHours} h` : null,
    project.difficulty ? project.difficulty : null,
    project.dependency ? `needs: ${project.dependency}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Rocket size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-muted-foreground" />
          <h3 className="text-sm font-medium">{project.title}</h3>
        </div>
        <button
          type="button"
          onClick={toggleFav}
          disabled={favPending}
          aria-label={project.favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={project.favorite}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-amber-500"
        >
          <Star
            size={16}
            strokeWidth={1.5}
            weight={project.favorite ? "fill" : "regular"}
            className={project.favorite ? "text-amber-500" : ""}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={CATEGORY_BADGE[project.category] ?? ""}>
          {project.category}
        </Badge>
        {project.stageRef && <Badge variant="secondary">{project.stageRef}</Badge>}
        {priorityBadge(project.priority)}
      </div>

      {project.description && (
        <ClampedText text={project.description} lines={2} />
      )}

      {meta.length > 0 && (
        <p className="text-xs text-muted-foreground">{meta.join(" · ")}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="text-xs text-muted-foreground">
          {project.weekWhen ?? ""}
        </span>
        <div className="flex items-center gap-2">
          {note && <span className="text-xs text-primary">{note}</span>}
          <Button variant="outline" size="xs" onClick={addTask} disabled={taskPending}>
            <ListPlus size={14} strokeWidth={1.5} aria-hidden="true" />
            {taskPending ? "Adding…" : "Add as task"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPageClient({
  projects,
  categories,
  filters,
}: {
  projects: Project[];
  categories: ProjectCategoryCount[];
  filters: ProjectFilters;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search ?? "");

  const totalCount = useMemo(
    () => categories.reduce((s, c) => s + c.count, 0),
    [categories],
  );

  // Group visible projects by category (in canonical order).
  const grouped = useMemo(() => {
    const map = new Map<string, Project[]>();
    for (const p of projects) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    const cats = [...map.keys()].sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a);
      const ib = CATEGORY_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return cats.map((cat) => ({ category: cat, items: map.get(cat)! }));
  }, [projects]);

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`/projects?${params.toString()}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", search.trim() || undefined);
  }

  function toggleFavorites() {
    const params = new URLSearchParams(window.location.search);
    if (filters.favoritesOnly) params.delete("fav");
    else params.set("fav", "1");
    router.push(`/projects?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl tracking-tight md:text-3xl">Projects</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Every project in your roadmap — {totalCount} builds across DSA,
          Classical ML, Reinforcement Learning, and LLM Systems. Star the ones
          you&rsquo;re committing to and add any of them to your tasks.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <form onSubmit={submitSearch} className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            aria-label="Search projects"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.category ?? "all"} onValueChange={(v) => updateParam("category", v)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories ({totalCount})</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.category} value={c.category}>
                  {c.category} ({c.count})
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

          <span className="ml-auto text-sm text-muted-foreground">{projects.length} shown</span>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <Rocket size={24} strokeWidth={1.5} aria-hidden="true" className="text-muted-foreground" />
          <p className="text-sm font-medium">No projects match these filters.</p>
          <p className="text-sm text-muted-foreground">Try clearing the search or filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((group) => (
            <section key={group.category} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {group.category}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {group.items.length}
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

