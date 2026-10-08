import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMarathons } from "@/lib/queries";
import { MarathonsPageClient } from "@/components/marathons/marathons-page-client";

export const instant = false;

export default async function MarathonsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const marathons = await getMarathons();

  if (!marathons) {
    redirect("/sign-in");
  }

  const canDelete =
    session.user.role === "admin" || session.user.role === "owner";

  return (
    <MarathonsPageClient
      initialMarathons={marathons}
      canDelete={canDelete}
    />
  );
}
