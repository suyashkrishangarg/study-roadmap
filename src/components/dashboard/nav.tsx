"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  CalendarBlank,
  ChartBarHorizontal,
  ChartPie,
  ChatCircleDots,
  CopySimple,
  Exam,
  Hourglass,
  House,
  ListChecks,
  MapTrifold,
  BookOpen,
  Books,
  Rocket,
  Compass,
  Timer,
} from "@phosphor-icons/react/ssr";

const links = [
  { href: "/", label: "Dashboard", icon: House, match: "/" },
  { href: "/tasks", label: "Tasks", icon: ListChecks, match: "/tasks" },
  { href: "/roadmaps", label: "Roadmaps", icon: MapTrifold, match: "/roadmaps" },
  { href: "/resources", label: "Resources", icon: Books, match: "/resources" },
  { href: "/projects", label: "Projects", icon: Rocket, match: "/projects" },
  { href: "/timeline", label: "Timeline", icon: ChartBarHorizontal, match: "/timeline" },
  { href: "/calendar", label: "Calendar", icon: CalendarBlank, match: "/calendar" },
  { href: "/check-ins", label: "Check-ins", icon: Timer, match: "/check-ins" },
  { href: "/practice", label: "Practice", icon: BookOpen, match: "/practice" },
  { href: "/quizzes", label: "Quizzes", icon: Exam, match: "/quizzes" },
  { href: "/flashcards", label: "Flashcards", icon: CopySimple, match: "/flashcards" },
  { href: "/marathons", label: "Marathons", icon: Hourglass, match: "/marathons" },
  { href: "/analytics", label: "Analytics", icon: ChartPie, match: "/analytics" },
  { href: "/assistant", label: "Assistant", icon: ChatCircleDots, match: "/assistant" },
  { href: "/guide", label: "Guide", icon: Compass, match: "/guide" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="min-w-0 max-w-full flex-1 overflow-x-auto pb-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
      aria-label="Main"
    >
      <div className="flex items-center gap-1">
        {links.map((link) => {
          const active =
            link.match === "/"
              ? pathname === "/"
              : pathname.startsWith(link.match);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
              )}
            >
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
              <span className="hidden lg:inline">{link.label}</span>
              <span className="sr-only lg:hidden">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
