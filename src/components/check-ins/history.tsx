import { dateKey, formatMinutes } from "@/lib/dates";
import type { CheckIn } from "@prisma/client";

export function CheckInHistory({
  checkIns,
}: {
  checkIns: CheckIn[];
}) {
  if (checkIns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No check-ins yet. Log your first study session from the dashboard.
      </p>
    );
  }

  const groups = new Map<string, CheckIn[]>();
  for (const checkIn of checkIns) {
    const key = dateKey(checkIn.date);
    const existing = groups.get(key);
    if (existing) {
      existing.push(checkIn);
    } else {
      groups.set(key, [checkIn]);
    }
  }

  const entries = [...groups.entries()].reverse();

  return (
    <ul className="flex flex-col gap-6">
      {entries.map(([key, items]) => {
        const date = items[0].date;
        const total = items.reduce((s, c) => s + c.durationMin, 0);
        return (
          <li key={key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              <span className="text-xs text-muted-foreground">
                {formatMinutes(total)}
              </span>
            </div>
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.subject}
                    </p>
                    {item.note && (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatMinutes(item.durationMin)}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
