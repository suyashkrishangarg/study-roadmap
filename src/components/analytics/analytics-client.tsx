"use client";

import dynamic from "next/dynamic";
import {
  ChartPie,
  Clock,
  CopySimple,
  Fire,
  Medal,
  Target,
  Trophy,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMinutes } from "@/lib/dates";
import type { AnalyticsData } from "@/lib/queries";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(
  () => import("react-apexcharts").then((m) => m.default),
  { ssr: false },
);

const BADGE_ICONS: Record<string, typeof Medal> = {
  "first-checkin": Fire,
  "streak-3": Fire,
  "streak-7": Fire,
  "minutes-600": Clock,
  "minutes-1000": Clock,
  "quiz-debut": Trophy,
  perfect: Trophy,
  "cards-10": CopySimple,
  marathon: Target,
  "tasks-10": Medal,
  "early-bird": Fire,
};

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const radarOptions: ApexOptions = {
    chart: { id: "mastery-radar" },
    xaxis: { categories: data.radar.topics },
    yaxis: { max: 100, min: 0 },
    dataLabels: { enabled: false },
    stroke: { width: 2 },
    fill: { opacity: 0.15 },
    legend: { position: "bottom" },
    colors: ["#6366f1", "#22c55e"],
    noData: { text: "No quiz or practice data yet" },
  };

  const polygraphOptions: ApexOptions = {
    chart: { id: "activity-polygraph" },
    xaxis: { categories: data.polygraph.map((p) => p.label) },
    yaxis: [
      {
        title: { text: "Minutes" },
        seriesName: "Minutes",
      },
      {
        title: { text: "Tasks" },
        seriesName: "Tasks",
        opposite: true,
      },
      {
        title: { text: "Quiz %" },
        seriesName: "Quiz score",
        opposite: true,
        min: 0,
        max: 100,
      },
    ],
    dataLabels: { enabled: false },
    legend: { position: "bottom" },
    stroke: { width: [0, 0, 3] },
    colors: ["#6366f1", "#f59e0b", "#22c55e"],
    plotOptions: { bar: { columnWidth: "55%" } },
  };

  const retentionOptions: ApexOptions = {
    chart: { id: "retention-curve" },
    xaxis: {
      categories: data.retention.repetitions.map((r) =>
        r === 0 ? "New" : `Rep ${r}${r >= 5 ? "+" : ""}`,
      ),
    },
    yaxis: { title: { text: "Avg interval (days)" } },
    dataLabels: { enabled: true },
    stroke: { width: 3 },
    colors: ["#8b5cf6"],
    markers: { size: 5 },
    noData: { text: "Review some flashcards to see the curve" },
  };

  const radarSeries =
    data.radar.topics.length > 0
      ? [
          {
            name: "Quiz accuracy",
            data: data.radar.quizAccuracy,
          },
          {
            name: "Practice mastery",
            data: data.radar.practiceMastery,
          },
        ]
      : [];

  const polygraphSeries = [
    {
      name: "Minutes",
      type: "bar" as const,
      data: data.polygraph.map((p) => p.minutes),
    },
    {
      name: "Tasks",
      type: "bar" as const,
      data: data.polygraph.map((p) => p.tasks),
    },
    {
      name: "Quiz score",
      type: "line" as const,
      data: data.polygraph.map((p) => p.quizPct),
    },
  ];

  const retentionSeries = [
    {
      name: "Avg interval",
      data: data.retention.avgInterval,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl tracking-tight md:text-3xl">
          Analytics
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Mastery, retention, and group activity.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Fire}
          label="Day streak"
          value={String(data.totals.streak)}
        />
        <StatCard
          icon={Clock}
          label="Minutes this week"
          value={formatMinutes(data.totals.weekMinutes)}
        />
        <StatCard
          icon={Target}
          label="Card retention"
          value={`${data.retention.retentionRate}%`}
        />
        <StatCard
          icon={CopySimple}
          label="Cards due"
          value={String(data.totals.dueFlashcards)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartPie size={16} strokeWidth={1.5} aria-hidden="true" />
              Subject mastery
            </CardTitle>
            <CardDescription>
              Quiz accuracy vs. practice-question mastery by
              topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={radarOptions}
              series={radarSeries}
              type="radar"
              height={320}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartPie size={16} strokeWidth={1.5} aria-hidden="true" />
              Retention curve
            </CardTitle>
            <CardDescription>
              Average flashcard interval by repetition count
              (SM-2)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={retentionOptions}
              series={retentionSeries}
              type="line"
              height={320}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ChartPie size={16} strokeWidth={1.5} aria-hidden="true" />
            Activity polygraph
          </CardTitle>
          <CardDescription>
            Study minutes, completed tasks, and quiz scores —
            last 14 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Chart
            options={polygraphOptions}
            series={polygraphSeries}
            type="bar"
            height={340}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy size={16} strokeWidth={1.5} aria-hidden="true" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            This week&apos;s minutes, streaks, and quiz
            performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No activity yet this week.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {data.leaderboard.map((row, i) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center gap-3 rounded-md bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="w-5 shrink-0 font-medium text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span className="min-w-32 flex-1 truncate font-medium">
                    {row.name ?? row.email}
                  </span>
                  <Badge variant="secondary" className="shrink-0">
                    {formatMinutes(row.weekMinutes)} this week
                  </Badge>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {row.streak}d streak
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {row.tasksDone} tasks
                  </span>
                  {row.quizPct !== null && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {row.quizPct}% quiz avg
                    </span>
                  )}
                  {row.marathonMinutes > 0 && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatMinutes(row.marathonMinutes)} marathons
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Medal size={16} strokeWidth={1.5} aria-hidden="true" />
            Badges
          </CardTitle>
          <CardDescription>
            {data.badges.filter((b) => b.earned).length} of{" "}
            {data.badges.length} earned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.badges.map((badge) => {
              const Icon = BADGE_ICONS[badge.id] ?? Medal;
              return (
                <div
                  key={badge.id}
                  className={
                    badge.earned
                      ? "flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-3"
                      : "flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3 opacity-60"
                  }
                >
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {badge.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Medal;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
