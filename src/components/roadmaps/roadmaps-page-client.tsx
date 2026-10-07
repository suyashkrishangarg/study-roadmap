"use client";

import Link from "next/link";
import { useState } from "react";
import { MapTrifold, Plus } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RoadmapFormDialog } from "@/components/roadmaps/roadmap-form-dialog";
import type { Roadmap } from "@prisma/client";

export type RoadmapWithItems = Roadmap & {
  author: { id: string; name: string | null };
  items: {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    assignee: { id: string; name: string | null } | null;
  }[];
};

function dateRange(start: Date | null, end: Date | null) {
  if (!start && !end) return null;
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end as Date)}`;
}

export function RoadmapsPageClient({
  roadmaps,
}: {
  roadmaps: RoadmapWithItems[];
}) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl">Roadmaps</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Long-term plans broken into trackable items.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          New roadmap
        </Button>
      </div>

      {roadmaps.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <MapTrifold size={24} strokeWidth={1.5} aria-hidden="true" className="text-muted-foreground" />
          <p className="text-sm font-medium">No roadmaps yet.</p>
          <p className="text-sm text-muted-foreground">
            Create a roadmap to plan a course, project, or exam prep.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {roadmaps.map((roadmap) => {
            const done = roadmap.items.filter((i) => i.status === "done").length;
            const total = roadmap.items.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Link key={roadmap.id} href={`/roadmaps/${roadmap.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/30">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{roadmap.title}</CardTitle>
                      <Badge variant="secondary">
                        {done}/{total} done
                      </Badge>
                    </div>
                    {roadmap.description && (
                      <CardDescription className="line-clamp-2">
                        {roadmap.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <Progress value={pct} aria-label={`${roadmap.title} progress`} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{dateRange(roadmap.startDate, roadmap.endDate)}</span>
                      <span>{roadmap.author.name ?? "Unknown"}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <RoadmapFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
