import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAnalytics } from "@/lib/queries";
import { AnalyticsClient } from "@/components/analytics/analytics-client";


export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const analytics = await getAnalytics();

  if (!analytics) {
    redirect("/sign-in");
  }

  return <AnalyticsClient data={analytics} />;
}
