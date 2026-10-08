"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaretLeft, CaretRight, ListChecks, MapTrifold } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import { dateKey } from "@/lib/dates";
import type { CalendarEvent } from "@/lib/queries";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarClient({
  month,
  events,
}: {
  month: Date;
  events: CalendarEvent[];
}) {
  const router = useRouter();

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayKey = dateKey(new Date());

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = dateKey(event.date);
    const existing = eventsByDay.get(key);
    if (existing) {
      existing.push(event);
    } else {
      eventsByDay.set(key, [event]);
    }
  }

  function shiftMonth(delta: number) {
    const next = new Date(year, monthIndex + delta, 1);
    const query = `month=${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    router.push(`/calendar?${query}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl">Calendar</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Task deadlines and roadmap item due dates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <CaretLeft size={16} strokeWidth={1.5} aria-hidden="true" />
          </Button>
          <span className="min-w-36 text-center text-sm font-semibold">
            {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => shiftMonth(1)} aria-label="Next month">
            <CaretRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="min-h-28 border-b border-r border-border/40 bg-muted/20" />;
            }
            const key = dateKey(date);
            const dayEvents = eventsByDay.get(key) ?? [];
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={cn(
                  "flex min-h-28 flex-col gap-1 border-b border-r border-border/40 p-1.5",
                  isToday && "bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {date.getDate()}
                </span>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((event) => {
                    const href =
                      event.kind === "task"
                        ? "/tasks"
                        : event.roadmapId
                          ? `/roadmaps/${event.roadmapId}`
                          : "/roadmaps";
                    return (
                      <Link key={event.id} href={href}>
                        <span
                          className={cn(
                            "block truncate rounded px-1.5 py-0.5 text-[11px] font-medium",
                            event.kind === "task"
                              ? "bg-primary/15 text-primary"
                              : "bg-secondary text-secondary-foreground",
                            event.status === "done" && "opacity-50 line-through",
                          )}
                          title={`${event.kind === "task" ? "Task" : "Roadmap item"}: ${event.title}`}
                        >
                          {event.kind === "task" ? (
                            <ListChecks size={10} strokeWidth={2} aria-hidden="true" className="mr-1 inline" />
                          ) : (
                            <MapTrifold size={10} strokeWidth={2} aria-hidden="true" className="mr-1 inline" />
                          )}
                          {event.title}
                        </span>
                      </Link>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="px-1.5 text-[10px] text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
          Task deadline
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-secondary" />
          Roadmap item due
        </span>
        <Badge variant="outline" className="ml-auto">
          {events.length} event{events.length === 1 ? "" : "s"} this month
        </Badge>
      </div>
    </div>
  );
}
