"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SignOut } from "@phosphor-icons/react/ssr";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="shrink-0"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      <SignOut size={16} strokeWidth={1.5} aria-hidden="true" />
      <span className="hidden sm:inline">Sign out</span>
      <span className="sr-only sm:hidden">Sign out</span>
    </Button>
  );
}
