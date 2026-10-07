"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCheckIn } from "@/server-actions/check-ins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Timer } from "@phosphor-icons/react/ssr";

export function CheckInForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (
      _prev: { ok: boolean; error?: string } | null,
      formData: FormData,
    ) => {
      const result = await createCheckIn({
        subject: formData.get("subject") as string,
        durationMin: Number(formData.get("durationMin")),
        note: formData.get("note") as string,
      });
      if (result.ok) {
        router.refresh();
        formRef.current?.reset();
      }
      return result;
    },
    null,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Timer size={18} strokeWidth={1.5} aria-hidden="true" />
          <CardTitle className="text-base">Log study time</CardTitle>
        </div>
        <CardDescription>
          Check in with what you studied and for how long.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              required
              maxLength={120}
              placeholder="e.g. Mathematics"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="durationMin">Duration (minutes)</Label>
            <Input
              id="durationMin"
              name="durationMin"
              type="number"
              required
              min={1}
              max={1440}
              step={1}
              placeholder="45"
              inputMode="numeric"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">
              Note{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="note"
              name="note"
              maxLength={500}
              rows={2}
              placeholder="What did you cover?"
            />
          </div>
          {state && !state.ok && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          {state?.ok && (
            <p className="text-sm text-primary" role="status">
              Check-in saved.
            </p>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save check-in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
