"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Flag,
  Hourglass,
  Play,
  Plus,
  Trash,
  Trophy,
  Users,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  deleteMarathon,
  endMarathonSession,
  logMarathonMinutes,
  startMarathonSession,
} from "@/server-actions/marathons";
import { MarathonFormDialog } from "@/components/marathons/marathon-form-dialog";
import { formatMinutes } from "@/lib/dates";
import type { MarathonWithStats } from "@/lib/queries";

function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Live now";
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const minutes = totalMin % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function MarathonsPageClient({
  initialMarathons,
  canDelete,
}: {
  initialMarathons: MarathonWithStats[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const now = useNow();

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Delete this marathon and all its sessions? This cannot be undone.",
      )
    )
      return;
    setDeletingId(id);
    const result = await deleteMarathon(id);
    setDeletingId(null);
    if (result.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl">
            Marathons
          </h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Focused study events with a live timer, per-member
            minutes, and a leaderboard.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          New marathon
        </Button>
      </div>

      {initialMarathons.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hourglass size={18} strokeWidth={1.5} aria-hidden="true" />
              No marathons yet
            </CardTitle>
            <CardDescription>
              Create a scheduled group event or an on-demand focus
              session.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {initialMarathons.map((marathon) => (
            <MarathonCard
              key={marathon.id}
              marathon={marathon}
              now={now}
              canDelete={canDelete}
              deleting={deletingId === marathon.id}
              onDelete={() => handleDelete(marathon.id)}
            />
          ))}
        </div>
      )}

      <MarathonFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function MarathonCard({
  marathon,
  now,
  canDelete,
  deleting,
  onDelete,
}: {
  marathon: MarathonWithStats;
  now: Date | null;
  canDelete: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const loggedRef = useRef(0);

  const mySession = marathon.mySession;
  const persistedMin = mySession?.minutes ?? 0;
  const elapsedMs =
    mySession && now ? now.getTime() - mySession.startedAt.getTime() : 0;
  const elapsedMin = persistedMin + Math.floor(elapsedMs / 60000);
  const goalMin = marathon.goalMin ?? marathon.durationMin;
  const goalPct =
    goalMin > 0
      ? Math.min(100, Math.round((elapsedMin / goalMin) * 100))
      : 0;

  const future =
    marathon.type === "scheduled" &&
    marathon.startsAt !== null &&
    (now ? marathon.startsAt.getTime() > now.getTime() : false);

  useEffect(() => {
    if (!mySession || elapsedMin <= loggedRef.current) return;
    const increment = elapsedMin - loggedRef.current;
    loggedRef.current = elapsedMin;
    logMarathonMinutes(marathon.id, increment).catch(() => {});
  }, [elapsedMin, mySession, marathon.id]);

  async function handleStart() {
    setPending(true);
    const result = await startMarathonSession(marathon.id);
    setPending(false);
    if (result.ok) {
      loggedRef.current = 0;
      router.refresh();
    }
  }

  async function handleEnd() {
    setPending(true);
    const remainder = Math.max(0, elapsedMin - loggedRef.current);
    const result = await endMarathonSession(marathon.id, remainder);
    setPending(false);
    if (result.ok) {
      loggedRef.current = 0;
      router.refresh();
    }
  }

  const completionRate =
    marathon.participants > 0
      ? Math.round((marathon.completedSessions / marathon.participants) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Hourglass size={16} strokeWidth={1.5} aria-hidden="true" />
              {marathon.title}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <Badge variant={marathon.type === "scheduled" ? "default" : "secondary"}>
                {marathon.type === "scheduled" ? "Scheduled" : "On-demand"}
              </Badge>
              {marathon.type === "scheduled" && marathon.startsAt && (
                <span className="flex items-center gap-1">
                  <Clock size={13} aria-hidden="true" />
                  {now
                    ? future
                      ? `${marathon.startsAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })} (${formatCountdown(
                          marathon.startsAt.getTime() - now.getTime(),
                        )})`
                      : "Started"
                    : "…"}
                </span>
              )}
              <span>
                {marathon.durationMin} min
                {marathon.goalMin ? ` · goal ${marathon.goalMin} min` : ""}
              </span>
            </CardDescription>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0 hover:text-destructive"
              onClick={onDelete}
              disabled={deleting}
              aria-label="Delete marathon"
            >
              <Trash size={15} strokeWidth={1.5} aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users size={15} aria-hidden="true" />
            {marathon.participants} participant
            {marathon.participants === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={15} aria-hidden="true" />
            {formatMinutes(marathon.totalMinutes)} total
          </span>
          <span className="flex items-center gap-1.5">
            <Flag size={15} aria-hidden="true" />
            {completionRate}% completion
          </span>
        </div>

        {mySession ? (
          <div className="flex flex-col gap-2 rounded-md border border-primary/30 bg-primary/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Play size={15} className="animate-pulse" aria-hidden="true" />
                Session running
              </span>
              <span className="font-mono text-2xl tracking-tight tabular-nums">
                {formatElapsed(elapsedMs)}
              </span>
            </div>
            <Progress value={goalPct} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {elapsedMin} / {goalMin} min
              </span>
              <span>{goalPct}% of goal</span>
            </div>
            <div>
              <Button onClick={handleEnd} disabled={pending}>
                <Flag size={15} strokeWidth={1.5} aria-hidden="true" />
                End session
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button onClick={handleStart} disabled={pending || future}>
              <Play size={15} strokeWidth={1.5} aria-hidden="true" />
              {future
                ? "Starts soon"
                : mySession
                  ? "Resume"
                  : marathon.type === "scheduled"
                    ? "Join marathon"
                    : "Start focus session"}
            </Button>
          </div>
        )}

        {marathon.sessions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Trophy size={15} aria-hidden="true" />
              Leaderboard
            </span>
            <div className="flex flex-col gap-1">
              {marathon.sessions.slice(0, 5).map((row, i) => (
                <div
                  key={row.userId}
                  className="flex items-center gap-3 rounded-md bg-muted/30 px-3 py-1.5 text-sm"
                >
                  <span className="w-5 shrink-0 text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {row.name ?? row.email}
                  </span>
                  {row.completed > 0 && (
                    <Badge variant="outline" className="shrink-0">
                      {row.completed} done
                    </Badge>
                  )}
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatMinutes(row.minutes)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
