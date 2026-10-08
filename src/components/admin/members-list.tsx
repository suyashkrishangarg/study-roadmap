import { ShieldCheck, Trash, UserMinus } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminUserRow } from "@/server-actions/admin";

function roleBadge(role: string) {
  if (role === "owner") return <Badge>Owner</Badge>;
  if (role === "admin") return <Badge variant="secondary">Admin</Badge>;
  return <Badge variant="outline">Member</Badge>;
}

export function MembersList({
  users,
  currentUserId,
  busyId,
  onRole,
  onRemove,
  onDelete,
}: {
  users: AdminUserRow[];
  currentUserId: string;
  busyId: string | null;
  onRole: (id: string, role: "admin" | "member") => void;
  onRemove: (id: string, name: string | null) => void;
  onDelete: (id: string, name: string | null) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Members</CardTitle>
        <CardDescription>
          {users.length} {users.length === 1 ? "person" : "people"} in this
          workspace. Owners cannot be changed or removed here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No members found.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {users.map((u) => {
              const locked = u.role === "owner" || u.id === currentUserId;
              const busy = busyId === u.id;
              return (
                <li key={u.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {u.name ?? "Unnamed"}
                        {u.id === currentUserId && (
                          <span className="text-muted-foreground"> (you)</span>
                        )}
                      </span>
                      {roleBadge(u.role)}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {u.email} · {u._count.authoredTasks} tasks ·{" "}
                      {u._count.checkIns} check-ins · {u._count.quizzes} quizzes
                    </p>
                  </div>
                  {!locked ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Select
                        value={u.role}
                        onValueChange={(v) => onRole(u.id, v as "admin" | "member")}
                        disabled={busy}
                      >
                        <SelectTrigger
                          className="h-8 w-28"
                          aria-label={`Role for ${u.email}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 px-0"
                        disabled={busy}
                        onClick={() => onRemove(u.id, u.name)}
                        aria-label={`Remove ${u.email} from workspace`}
                      >
                        <UserMinus size={15} strokeWidth={1.5} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 px-0 hover:text-destructive"
                        disabled={busy}
                        onClick={() => onDelete(u.id, u.name)}
                        aria-label={`Delete ${u.email} completely`}
                      >
                        <Trash size={15} strokeWidth={1.5} aria-hidden="true" />
                      </Button>
                    </div>
                  ) : (
                    u.id !== currentUserId && (
                      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <ShieldCheck size={14} aria-hidden="true" />
                        Protected
                      </span>
                    )
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
