import type { ComponentType } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDashboardData } from "@/lib/queries";
import { formatMinutes } from "@/lib/dates";
import { redirect } from "next/navigation";
import { JoinWorkspaceForm } from "@/components/join-workspace-form";
import { InviteCodeCard } from "@/components/invite-code-card";
import { CheckInForm } from "@/components/check-in-form";
import { WeekChart } from "@/components/dashboard/week-chart";
import { TaskTrendChart } from "@/components/dashboard/task-trend-chart";
import { DueTasks } from "@/components/dashboard/due-tasks";
import { GoalsCard } from "@/components/dashboard/goals-card";
import { Clock, Fire, Target } from "@phosphor-icons/react/ssr";


function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: ComponentType<{
    size?: number | string;
    strokeWidth?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.user.workspaceId) {
    return <JoinWorkspaceForm />;
  }

  const [workspace, data] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: session.user.workspaceId },
      select: { name: true, inviteCode: true },
    }),
    getDashboardData(),
  ]);

  if (!workspace || !data) {
    redirect("/sign-in");
  }

  const isAdmin = session.user.role === "admin" || session.user.role === "owner";
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <>
      <h1 className="text-2xl tracking-tight md:text-3xl">
        Good day, {firstName}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-muted-foreground">
        Welcome to the {workspace.name ?? "Study"} workspace.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Clock}
          label="Today"
          value={formatMinutes(data.todayMinutes)}
          hint={data.checkedInToday ? "Checked in" : "Not checked in yet"}
        />
        <StatCard
          icon={Fire}
          label="Streak"
          value={`${data.streak} day${data.streak === 1 ? "" : "s"}`}
          hint="Consecutive study days"
        />
        <StatCard
          icon={Target}
          label="Active goals"
          value={String(data.goals.length)}
          hint={
            data.goals.length > 0
              ? `${data.goals.filter((g) => g.pct >= 100).length} met so far`
              : "Set a target to get started"
          }
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <WeekChart data={data.week} />
            <TaskTrendChart data={data.taskTrend} />
            <DueTasks tasks={data.dueTasks} currentUserId={session.user.id} />
          </div>
        <div className="flex flex-col gap-6">
          <CheckInForm />
          <GoalsCard goals={data.goals} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <InviteCodeCard initialCode={workspace.inviteCode} isAdmin={isAdmin} />
      </div>
    </>
  );
}
