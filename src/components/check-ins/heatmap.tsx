import { addDays, dateKey, startOfDay, startOfWeek } from "@/lib/dates";
import { cn } from "cn";

function cellClass(minutes: number) {
  if (minutes <= 0) return "bg-muted";
  if (minutes < 30) return "bg-primary/25";
  if (minutes < 60) return "bg-primary/50";
  if (minutes < 120) return "bg-primary/75";
  return "bg-primary";
}

export function CheckInHeatmap({
  heatmap,
}: {
  heatmap: Record<string, number>;
}) {
  const today = startOfDay(new Date());
  const start = startOfWeek(addDays(today, -181));
  const totalDays =
    Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
  const numWeeks = Math.ceil(totalDays / 7);

  const weeks = [];
  for (let w = 0; w < numWeeks; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      if (date > today) {
        days.push(null);
        continue;
      }
      const key = dateKey(date);
      days.push({ date, minutes: heatmap[key] ?? 0 });
    }
    weeks.push(days);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-1 flex-col gap-1">
            {week.map((day, j) =>
              day ? (
                <div
                  key={j}
                  className={cn("size-3 shrink-0 rounded-sm", cellClass(day.minutes))}
                  title={`${day.date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}: ${day.minutes} min`}
                />
              ) : (
                <div key={j} className="size-3 shrink-0" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        <span className="size-3 rounded-sm bg-muted" />
        <span className="size-3 rounded-sm bg-primary/25" />
        <span className="size-3 rounded-sm bg-primary/50" />
        <span className="size-3 rounded-sm bg-primary/75" />
        <span className="size-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}
