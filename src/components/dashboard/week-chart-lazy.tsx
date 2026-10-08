"use client";

import dynamic from "next/dynamic";

const WeekChartInner = dynamic(
  () => import("./week-chart").then((m) => m.WeekChart),
  { ssr: false, loading: () => <div className="h-48 w-full animate-pulse rounded-md bg-muted/40" /> },
);

export function WeekChartLazy({
  data,
}: {
  data: { date: string; label: string; minutes: number }[];
}) {
  return <WeekChartInner data={data} />;
}
