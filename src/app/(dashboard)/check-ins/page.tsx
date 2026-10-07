import { auth } from "@/lib/auth";
import { getCheckInStats } from "@/lib/queries";
import { redirect } from "next/navigation";
import { CheckInsPageClient } from "@/components/check-ins/check-ins-page-client";

export const instant = false;

export default async function CheckInsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const stats = await getCheckInStats();

  if (!stats) {
    redirect("/sign-in");
  }

  return <CheckInsPageClient stats={stats} />;
}
