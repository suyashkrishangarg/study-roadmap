import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssistantClient } from "@/components/assistant/assistant-client";

export default async function AssistantPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  return <AssistantClient />;
}
