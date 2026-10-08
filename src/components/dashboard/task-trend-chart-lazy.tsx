"use client";

import dynamic from "next/dynamic";

const TaskTrendChartInner = dynamic(
  () => import("./task-trend-chart").then((m) => m.TaskTrendChart),
  { ssr: false, loading: () => <div className="h-40 w-full animate-pulse rounded-md bg-muted/40" /> },
);

export function TaskTrendChartLazy({
  data,
}: {
  data: { date: string; label: string; completed: number }[];
}) {
  return <TaskTrendChartInner data={data} />;
}
