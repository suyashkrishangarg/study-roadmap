"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleLogo, GraduationCap } from "@phosphor-icons/react/ssr";

export default function SignInPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap size={24} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl tracking-tight">Study</CardTitle>
          <CardDescription>
            Plan, track, and gamify exam prep with your friends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <GoogleLogo size={18} aria-hidden="true" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
