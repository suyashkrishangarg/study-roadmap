import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProjects, getProjectCategories } from "@/lib/queries";
import { ProjectsPageClient } from "@/components/projects/projects-page-client";

export default async function ProjectsPage({
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

  const category = str(params.category);
  const search = str(params.q);
  const favoritesOnly = str(params.fav) === "1";

  const [projects, categories] = await Promise.all([
    getProjects({ search, category, favoritesOnly }),
    getProjectCategories(),
  ]);

  if (!projects || !categories) {
    redirect("/sign-in");
  }

  return (
    <ProjectsPageClient
      projects={projects}
      categories={categories}
      filters={{ category, search, favoritesOnly }}
    />
  );
}
