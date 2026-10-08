import { auth } from "@/lib/auth";
import { getTimeline } from "@/lib/queries";
import { redirect } from "next/navigation";
import { TimelineClient } from "@/components/timeline/timeline-client";


export default async function TimelinePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const items = await getTimeline();

  if (!items) {
    redirect("/sign-in");
  }

  return <TimelineClient items={items} />;
}
