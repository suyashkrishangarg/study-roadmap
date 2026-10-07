import { auth } from "@/lib/auth";
import { getRoadmap, getWorkspaceMembers } from "@/lib/queries";
import { notFound, redirect } from "next/navigation";
import { RoadmapDetailClient } from "@/components/roadmaps/roadmap-detail-client";

export const instant = false;

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const { id } = await params;
  const [roadmap, members] = await Promise.all([
    getRoadmap(id),
    getWorkspaceMembers(),
  ]);

  if (!roadmap || !members) {
    notFound();
  }

  return (
    <RoadmapDetailClient roadmap={roadmap} members={members} />
  );
}
