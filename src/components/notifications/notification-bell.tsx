"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Bell, Clock, Exam, Flag, Megaphone } from "@phosphor-icons/react/ssr";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server-actions/notifications";
import type { Notification } from "@prisma/client";

const typeIcon = {
  deadline_approaching: Clock,
  marathon_starting: Flag,
  quiz_graded: Exam,
  system: Megaphone,
} as const;

const typeHref = {
  deadline_approaching: "/tasks",
  marathon_starting: "/marathons",
  quiz_graded: "/quizzes",
  system: "/",
} as const;

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationBell({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [prevInitial, setPrevInitial] = useState(initialNotifications);
  const [markAllState, markAllAction, markAllPending] = useActionState(
    async (): Promise<{ ok: boolean; error?: string }> => {
      const result = await markAllNotificationsRead();
      if (result.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
      }
      return { ok: result.ok, error: result.ok ? undefined : result.error };
    },
    null,
  );
  const router = useRouter();

  if (initialNotifications !== prevInitial) {
    setNotifications(initialNotifications);
    setPrevInitial(initialNotifications);
  }

  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 px-0">
          <Bell size={16} strokeWidth={1.5} aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          className="z-50 w-80 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-medium">Notifications</span>
            <DropdownMenuPrimitive.Item asChild>
              <button
                type="submit"
                formAction={markAllAction}
                disabled={markAllPending || unread === 0}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Mark all read
              </button>
            </DropdownMenuPrimitive.Item>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcon[n.type] ?? Megaphone;
                return (
                  <DropdownMenuPrimitive.Item key={n.id} asChild>
                    <Link
                      href={typeHref[n.type] ?? "/"}
                      onClick={() => {
                        if (!n.readAt) {
                          markNotificationRead(n.id).then((result) => {
                            if (result.ok) {
                              setNotifications((prev) =>
                                prev.map((x) =>
                                  x.id === n.id ? { ...x, readAt: new Date() } : x,
                                ),
                              );
                            }
                          });
                        }
                        router.refresh();
                      }}
                      className={cn(
                        "flex items-start gap-2.5 px-3 py-2.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground",
                        !n.readAt && "bg-accent/40",
                      )}
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{n.title}</span>
                        {n.body && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {n.body}
                          </span>
                        )}
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                      {!n.readAt && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </Link>
                  </DropdownMenuPrimitive.Item>
                );
              })
            )}
          </div>
          {markAllState && !markAllState.ok && (
            <p className="border-t border-border px-3 py-2 text-xs text-destructive">
              {markAllState.error}
            </p>
          )}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
