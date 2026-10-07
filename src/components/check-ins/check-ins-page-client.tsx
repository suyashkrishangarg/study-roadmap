"use client";

import { useState } from "react";
import { CheckInForm } from "@/components/check-in-form";
import { CheckInHeatmap } from "@/components/check-ins/heatmap";
import { CheckInHistory } from "@/components/check-ins/history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame, Timer } from "@phosphor-icons/react/ssr";
import { formatMinutes } from "@/lib/dates";
import type { getCheckInStats } from "@/lib/queries";

type Stats = Awaited<ReturnType<typeof getCheckInStats>>;

export function CheckInsPageClient({
  stats,
}: {
  stats: NonNullable<Stats>;
}) {
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl tracking-tight md:text-3xl">Check-ins</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Your study log, streaks, and history.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame size={16} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-xs font-medium">Current streak</span>
          </div>
          <span className="text-2xl font-semibold tracking-tight">
            {stats.streak} day{stats.streak === 1 ? "" : "s"}
          </span>
          <span className="text-xs text-muted-foreground">
            Consecutive study days
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer size={16} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-xs font-medium">Today</span>
          </div>
          <span className="text-2xl font-semibold tracking-tight">
            {formatMinutes(stats.todayMinutes)}
          </span>
          <span className="text-xs text-muted-foreground">
            {stats.todayCheckIns.length} check-in
            {stats.todayCheckIns.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer size={16} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-xs font-medium">Last 6 months</span>
          </div>
          <span className="text-2xl font-semibold tracking-tight">
            {formatMinutes(stats.totalMinutes)}
          </span>
          <span className="text-xs text-muted-foreground">
            {stats.checkIns.length} total check-ins
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <CheckInForm />
        </div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
            <CardDescription>
              Study minutes over the last 26 weeks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CheckInHeatmap heatmap={stats.heatmap} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-base">History</CardTitle>
              <CardDescription>
                Recent check-ins, newest first.
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="text-sm font-medium text-primary hover:underline"
            >
              {historyOpen ? "Hide" : "Show"}
            </button>
          </div>
        </CardHeader>
        {historyOpen && (
          <CardContent>
            <CheckInHistory checkIns={stats.checkIns} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
