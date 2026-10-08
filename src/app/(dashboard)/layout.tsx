import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureUpcomingNotifications } from "@/lib/notifications";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardNav } from "@/components/dashboard/nav";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShieldCheck } from "@phosphor-icons/react/ssr";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fire-and-forget: notification generation must NEVER block the layout.
  // (Previously `await`ed here = 2-4 extra DB round-trips on EVERY page click.)
  if (session.user.workspaceId) {
    ensureUpcomingNotifications(
      session.user.id,
      session.user.workspaceId,
    ).catch(() => {
      // notifications are best-effort; never block the layout
    });
  }

  const isAdmin = session.user.role === "admin" || session.user.role === "owner";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex shrink-0 items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap size={18} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Study</span>
            </div>
            {session.user.workspaceId && <DashboardNav />}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {session.user.workspaceId && <NotificationBell />}
            {session.user.workspaceId && isAdmin && (
              <Button variant="ghost" size="sm" className="h-8 w-8 px-0" asChild>
                <Link href="/admin" aria-label="Admin console">
                  <ShieldCheck size={16} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </Button>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}
