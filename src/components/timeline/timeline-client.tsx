"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateRoadmapItem } from "@/server-actions/roadmaps";
import { addDays, startOfDay } from "@/lib/dates";
import { cn } from "cn";
import { CalendarBlank } from "@phosphor-icons/react/ssr";
import type { TimelineItem } from "@/lib/queries";

const DAY_WIDTH = 48;
const ROW_HEIGHT = 44;
const LABEL_WIDTH = 240;

type DragState = {
  id: string;
  pointerStartX: number;
  originalStart: number;
  originalEnd: number;
  currentStart: number;
  currentEnd: number;
};

function barClasses(item: TimelineItem) {
  if (item.status === "done") {
    return "bg-muted text-muted-foreground";
  }
  if (item.status === "in_progress") {
    return "bg-primary text-primary-foreground";
  }
  return "bg-primary/60 text-primary-foreground";
}

export function TimelineClient({ items }: { items: TimelineItem[] }) {
  const router = useRouter();
  const [drag, setDrag] = useState<DragState | null>(null);
  const [saving, setSaving] = useState(false);

  const today = startOfDay(new Date());

  const scheduled = items.filter((i) => i.startDate && i.endDate);
  const unscheduled = items.filter((i) => !i.startDate || !i.endDate);

  const { rangeStart, numDays } = useMemo(() => {
    if (scheduled.length === 0) {
      return { rangeStart: addDays(today, -7), numDays: 45 };
    }
    const starts = scheduled.map((i) => startOfDay(i.startDate as Date).getTime());
    const ends = scheduled.map((i) => startOfDay(i.endDate as Date).getTime());
    const min = Math.min(...starts, today.getTime());
    const max = Math.max(...ends, today.getTime());
    const start = addDays(new Date(min), -3);
    const end = addDays(new Date(max), 7);
    return {
      rangeStart: start,
      numDays: Math.round((end.getTime() - start.getTime()) / 86400000) + 1,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const dayIndex = (date: Date) =>
    Math.round((startOfDay(date).getTime() - rangeStart.getTime()) / 86400000);

  const months = useMemo(() => {
    const spans: { label: string; start: number; width: number }[] = [];
    let current = -1;
    for (let i = 0; i < numDays; i++) {
      const d = addDays(rangeStart, i);
      const m = d.getMonth();
      if (m !== current) {
        current = m;
        spans.push({
          label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          start: i,
          width: 1,
        });
      } else {
        spans[spans.length - 1].width++;
      }
    }
    return spans;
  }, [rangeStart, numDays]);

  const todayIndex = dayIndex(today);

  function handlePointerDown(e: React.PointerEvent, item: TimelineItem) {
    if (!item.startDate || !item.endDate) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const start = dayIndex(item.startDate);
    const end = dayIndex(item.endDate);
    setDrag({
      id: item.id,
      pointerStartX: e.clientX,
      originalStart: start,
      originalEnd: end,
      currentStart: start,
      currentEnd: end,
    });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const deltaDays = Math.round((e.clientX - drag.pointerStartX) / DAY_WIDTH);
    if (deltaDays === 0) return;
    const duration = drag.originalEnd - drag.originalStart;
    let newStart = drag.originalStart + deltaDays;
    newStart = Math.max(0, Math.min(numDays - 1 - duration, newStart));
    setDrag({
      ...drag,
      currentStart: newStart,
      currentEnd: newStart + duration,
    });
  }

  async function handlePointerUp() {
    if (!drag) return;
    const { id, currentStart, currentEnd, originalStart, originalEnd } = drag;
    setDrag(null);
    if (currentStart === originalStart && currentEnd === originalEnd) return;

    setSaving(true);
    const result = await updateRoadmapItem(id, {
      startDate: addDays(rangeStart, currentStart),
      endDate: addDays(rangeStart, currentEnd),
    });
    setSaving(false);
    if (result.ok) {
      router.refresh();
    }
  }

  function barRange(item: TimelineItem) {
    if (drag && drag.id === item.id) {
      return { start: drag.currentStart, end: drag.currentEnd };
    }
    return {
      start: dayIndex(item.startDate as Date),
      end: dayIndex(item.endDate as Date),
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl">Timeline</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Drag bars to reschedule roadmap items.
          </p>
        </div>
        {saving && (
          <span className="text-sm text-muted-foreground" role="status">
            Saving…
          </span>
        )}
      </div>

      {scheduled.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <CalendarBlank size={24} strokeWidth={1.5} aria-hidden="true" className="text-muted-foreground" />
          <p className="text-sm font-medium">Nothing scheduled yet.</p>
          <p className="text-sm text-muted-foreground">
            Add start and end dates to roadmap items to see them here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <div className="flex min-w-max">
            <div
              className="sticky left-0 z-30 shrink-0 border-r bg-card"
              style={{ width: LABEL_WIDTH }}
            >
              <div
                className="border-b"
                style={{ height: 56 }}
              >
                <span className="px-3 text-xs font-medium text-muted-foreground">
                  Item
                </span>
              </div>
              {scheduled.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-center border-b px-3"
                  style={{ height: ROW_HEIGHT }}
                >
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.roadmap.title}
                    {item.assignee ? ` · ${item.assignee.name ?? "Assigned"}` : ""}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative" style={{ width: numDays * DAY_WIDTH }}>
              <div
                className="border-b bg-background"
                style={{ height: 56 }}
              >
                <div className="flex" style={{ height: 28 }}>
                  {months.map((m) => (
                    <div
                      key={`${m.start}-${m.label}`}
                      className="flex items-center overflow-hidden border-l border-border/50 px-2 text-xs font-semibold"
                      style={{ width: m.width * DAY_WIDTH }}
                    >
                      <span className="truncate">{m.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex" style={{ height: 28 }}>
                  {Array.from({ length: numDays }).map((_, i) => {
                    const d = addDays(rangeStart, i);
                    const isToday = i === todayIndex;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex flex-col items-center justify-center border-l text-[10px]",
                          isToday
                            ? "border-border bg-primary/10 font-semibold text-primary"
                            : "border-border/50 text-muted-foreground",
                        )}
                        style={{ width: DAY_WIDTH }}
                      >
                        <span>{d.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
                        <span>{d.getDate()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative" style={{ height: scheduled.length * ROW_HEIGHT }}>
                <div className="absolute inset-0 flex">
                  {Array.from({ length: numDays }).map((_, i) => {
                    const d = addDays(rangeStart, i);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "border-l border-border/40",
                          isWeekend && "bg-muted/30",
                        )}
                        style={{ width: DAY_WIDTH }}
                      />
                    );
                  })}
                </div>

                {todayIndex >= 0 && todayIndex < numDays && (
                  <div
                    className="absolute bottom-0 top-0 z-10 w-px bg-destructive/70"
                    style={{ left: todayIndex * DAY_WIDTH + DAY_WIDTH / 2 }}
                  >
                    <span className="absolute -top-0 left-1/2 -translate-x-1/2 rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-semibold text-destructive-foreground">
                      Today
                    </span>
                  </div>
                )}

                {scheduled.map((item, rowIndex) => {
                  const { start, end } = barRange(item);
                  const isDragging = drag?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "absolute z-20 flex h-8 cursor-grab touch-none items-center overflow-hidden rounded-md px-2 text-xs font-medium shadow-sm active:cursor-grabbing",
                        barClasses(item),
                        isDragging && "opacity-80 shadow-md ring-2 ring-ring",
                      )}
                      style={{
                        left: start * DAY_WIDTH + 2,
                        width: (end - start + 1) * DAY_WIDTH - 4,
                        top: rowIndex * ROW_HEIGHT + 6,
                      }}
                      onPointerDown={(e) => handlePointerDown(e, item)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      aria-label={`${item.title}. Drag to reschedule.`}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.progress > 0 && (
                        <span
                          className="absolute bottom-0 left-0 h-1 bg-current opacity-40"
                          style={{ width: `${item.progress}%` }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {unscheduled.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Unscheduled ({unscheduled.length})
          </h2>
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {unscheduled.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <span className="text-xs text-muted-foreground">
                  {item.roadmap.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
