import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getResources, getResourceGroups, getRoadmapItemOptions } from "@/lib/queries";
import { ResourcesPageClient } from "@/components/resources/resources-page-client";
import type { ResourceLevel, ResourceType } from "@prisma/client";

const LEVELS = ["all", "Beginner", "Intermediate", "Advanced"] as const;
const TYPES = ["all", "video", "playlist", "website", "channel", "link"] as const;

export default async function ResourcesPage({
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
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  const group = str(params.group);
  const levelParam = str(params.level);
  const typeParam = str(params.type);
  const search = str(params.q);
  const favoritesOnly = str(params.fav) === "1";

  const level = (LEVELS as readonly string[]).includes(levelParam ?? "")
    ? (levelParam as ResourceLevel)
    : undefined;
  const type = (TYPES as readonly string[]).includes(typeParam ?? "")
    ? (typeParam as ResourceType)
    : undefined;

  const [resources, groups, roadmapOptions] = await Promise.all([
    getResources({ search, group, level, type, favoritesOnly }),
    getResourceGroups(),
    getRoadmapItemOptions(),
  ]);

  if (!resources || !groups || !roadmapOptions) {
    redirect("/sign-in");
  }

  return (
    <ResourcesPageClient
      resources={resources}
      groups={groups}
      roadmapOptions={roadmapOptions}
      filters={{ group, level, type, search, favoritesOnly }}
    />
  );
}
