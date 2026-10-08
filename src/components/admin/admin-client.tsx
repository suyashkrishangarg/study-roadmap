"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteUserCompletely,
  removeUserFromWorkspace,
  setUserRole,
  type AdminUserRow,
} from "@/server-actions/admin";
import type { ProviderSafe } from "@/lib/ai-providers";
import { ProvidersPanel } from "@/components/admin/providers-panel";
import { MembersList } from "@/components/admin/members-list";

export function AdminClient({
  initialUsers,
  usersError,
  initialProviders,
  currentUserId,
}: {
  initialUsers: AdminUserRow[];
  usersError: string | null;
  initialProviders: ProviderSafe[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(usersError);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleRole(userId: string, role: "admin" | "member") {
    setBusyId(userId);
    setError(null);
    const result = await setUserRole(userId, role);
    setBusyId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function handleRemove(userId: string, name: string | null) {
    if (
      !window.confirm(
        `Remove ${name ?? "this user"} from the workspace? Content stays, access goes.`,
      )
    )
      return;
    setBusyId(userId);
    setError(null);
    const result = await removeUserFromWorkspace(userId);
    setBusyId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function handleDelete(userId: string, name: string | null) {
    if (
      !window.confirm(
        `PERMANENTLY delete ${name ?? "this user"} and ALL their content? No undo.`,
      )
    )
      return;
    if (!window.confirm("Second confirmation: delete everything they made?"))
      return;
    setBusyId(userId);
    setError(null);
    const result = await deleteUserCompletely(userId);
    setBusyId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <MembersList
        users={initialUsers}
        currentUserId={currentUserId}
        busyId={busyId}
        onRole={(id, role) => void handleRole(id, role)}
        onRemove={(id, name) => void handleRemove(id, name)}
        onDelete={(id, name) => void handleDelete(id, name)}
      />
      <ProvidersPanel initialProviders={initialProviders} />
    </div>
  );
}
