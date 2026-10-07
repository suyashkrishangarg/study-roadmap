"use client";

import { useActionState, useState } from "react";
import { getInviteCode, regenerateInviteCode } from "@/server-actions/workspace";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowsClockwise, Copy, Key } from "@phosphor-icons/react/ssr";

export function InviteCodeCard({
  initialCode,
  isAdmin,
}: {
  initialCode: string;
  isAdmin: boolean;
}) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [state, regenerateAction, isRegenerating] = useActionState(
    async (
      _prev: { ok: boolean; error?: string; inviteCode?: string } | null,
    ) => {
      const result = await regenerateInviteCode();
      if (result.ok && result.data) {
        setCode(result.data.inviteCode);
      }
      return result;
    },
    null,
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (e.g. insecure context) — select fallback
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key size={18} strokeWidth={1.5} aria-hidden="true" />
          <CardTitle className="text-base">Invite code</CardTitle>
        </div>
        <CardDescription>
          Share this code so friends can join the workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 font-mono text-lg tracking-[0.3em]">
            {code}
          </code>
          <Button variant="outline" size="icon" onClick={copy} aria-label="Copy invite code">
            <Copy size={16} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </div>
        {copied && (
          <p className="text-sm text-primary" role="status">
            Copied to clipboard.
          </p>
        )}
        {isAdmin && (
          <form action={regenerateAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={isRegenerating}
            >
              <ArrowsClockwise size={14} strokeWidth={1.5} aria-hidden="true" />
              {isRegenerating ? "Regenerating…" : "Regenerate code"}
            </Button>
          </form>
        )}
        {state && !state.ok && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
