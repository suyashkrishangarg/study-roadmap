import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateInviteCode } from "@/lib/invite-code";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      workspaceId: string | null;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: { signIn: "/sign-in" },
  providers: [Google],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false;

      let workspace = await prisma.workspace.findFirst({
        orderBy: { createdAt: "asc" },
      });
      const isFirstUser = (await prisma.user.count()) === 0;

      if (!workspace) {
        workspace = await prisma.workspace.create({
          data: { name: "Study", inviteCode: generateInviteCode() },
        });
      }

      await prisma.user.upsert({
        where: { email: profile.email },
        update: { name: profile.name ?? null, image: profile.picture ?? null },
        create: {
          email: profile.email,
          name: profile.name ?? null,
          image: profile.picture ?? null,
          role: isFirstUser ? "owner" : "member",
          workspaceId: isFirstUser ? workspace.id : null,
        },
      });

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, role: true, workspaceId: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.workspaceId = dbUser.workspaceId;
        }
      }
      return session;
    },
  },
});
