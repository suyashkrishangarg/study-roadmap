import { auth } from "@/lib/auth";
import { getRoadmaps } from "@/lib/queries";
import { redirect } from "next/navigation";
import { RoadmapsPageClient } from "@/components/roadmaps/roadmaps-page-client";

export const instant = false;

export default async function RoadmapsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const roadmaps = await getRoadmaps();

  if (!roadmaps) {
    redirect("/sign-in");
  }

  return <RoadmapsPageClient roadmaps={roadmaps} />;
}
