"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  CalendarBlank,
  ChartBarHorizontal,
  House,
  ListChecks,
  MapTrifold,
  Timer,
} from "@phosphor-icons/react/ssr";

const links = [
  { href: "/", label: "Dashboard", icon: House, match: "/" },
  { href: "/tasks", label: "Tasks", icon: ListChecks, match: "/tasks" },
  { href: "/roadmaps", label: "Roadmaps", icon: MapTrifold, match: "/roadmaps" },
  { href: "/timeline", label: "Timeline", icon: ChartBarHorizontal, match: "/timeline" },
  { href: "/calendar", label: "Calendar", icon: CalendarBlank, match: "/calendar" },
  { href: "/check-ins", label: "Check-ins", icon: Timer, match: "/check-ins" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1" aria-label="Main">
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
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
