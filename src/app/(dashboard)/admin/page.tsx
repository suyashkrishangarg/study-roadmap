import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listProviders } from "@/lib/ai-providers";
import { listWorkspaceUsers } from "@/server-actions/admin";
import { AdminClient } from "@/components/admin/admin-client";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if (!session.user.workspaceId) redirect("/");
  const isAdmin = session.user.role === "admin" || session.user.role === "owner";
  if (!isAdmin) redirect("/");

  const [usersResult, providers] = await Promise.all([
    listWorkspaceUsers(),
    listProviders(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl tracking-tight md:text-3xl">Admin</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Manage workspace members and the AI providers the assistant, quiz
          generator, and flashcard generator can use.
        </p>
      </div>
      <AdminClient
        initialUsers={usersResult.ok ? usersResult.data : []}
        usersError={usersResult.ok ? null : usersResult.error}
        initialProviders={providers}
        currentUserId={session.user.id}
      />
    </div>
  );
}
