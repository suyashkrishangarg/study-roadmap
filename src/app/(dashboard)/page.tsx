import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { JoinWorkspaceForm } from "@/components/join-workspace-form";
import { InviteCodeCard } from "@/components/invite-code-card";
import { GraduationCap } from "@phosphor-icons/react/ssr";

export const instant = false;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.user.workspaceId) {
    return <JoinWorkspaceForm />;
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: session.user.workspaceId },
    select: { name: true, inviteCode: true },
  });

  if (!workspace) {
    redirect("/sign-in");
  }

  const isAdmin =
    session.user.role === "admin" || session.user.role === "owner";
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap size={18} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Study</span>
        </div>
        <SignOutButton />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-6">
        <h1 className="text-2xl tracking-tight md:text-3xl">
          Good day, {firstName}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Welcome to the {workspace.name ?? "Study"} workspace.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <InviteCodeCard initialCode={workspace.inviteCode} isAdmin={isAdmin} />
        </div>
      </main>
    </div>
  );
}
