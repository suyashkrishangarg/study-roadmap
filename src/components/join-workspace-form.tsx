"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { joinWorkspace } from "@/server-actions/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key } from "@phosphor-icons/react/ssr";

export function JoinWorkspaceForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (
      _prev: { ok: boolean; error?: string } | null,
      formData: FormData,
    ) => {
      const result = await joinWorkspace(formData.get("code") as string);
      if (result.ok) router.refresh();
      return result;
    },
    null,
  );

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Key size={24} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl tracking-tight">
            Join your workspace
          </CardTitle>
          <CardDescription>
            Ask your study group admin for the invite code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Invite code</Label>
              <Input
                id="code"
                name="code"
                required
                minLength={8}
                maxLength={8}
                placeholder="XXXXXXXX"
                autoComplete="off"
                className="uppercase tracking-widest"
              />
            </div>
            {state && !state.ok && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Joining…" : "Join workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
