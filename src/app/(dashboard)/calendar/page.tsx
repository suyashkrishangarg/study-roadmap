import { auth } from "@/lib/auth";
import { getCalendarEvents } from "@/lib/queries";
import { redirect } from "next/navigation";
import { CalendarClient } from "@/components/calendar/calendar-client";

export const instant = false;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const params = await searchParams;
  const monthParam = typeof params.month === "string" ? params.month : "";
  const [y, m] = monthParam.split("-").map(Number);
  const month =
    Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12
      ? new Date(y, m - 1, 1)
      : new Date();

  const events = await getCalendarEvents(month);

  if (!events) {
    redirect("/sign-in");
  }

  return <CalendarClient month={month} events={events} />;
}
