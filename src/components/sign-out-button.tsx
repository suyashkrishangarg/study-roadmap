"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SignOut } from "@phosphor-icons/react/ssr";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      <SignOut size={16} strokeWidth={1.5} aria-hidden="true" />
      Sign out
    </Button>
  );
}
