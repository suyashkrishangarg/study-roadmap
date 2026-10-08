import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listProviders } from "@/lib/ai-providers";
import { ProvidersClient } from "@/components/ai/providers-client";

export default async function AiSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if (!session.user.workspaceId) redirect("/");
  const isAdmin = session.user.role === "admin" || session.user.role === "owner";
  if (!isAdmin) redirect("/");

  const providers = await listProviders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl tracking-tight md:text-3xl">AI providers</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Connect any OpenAI-compatible LLM API. Models are discovered live
          from each provider and appear in every model picker with search.
        </p>
      </div>
      <ProvidersClient initialProviders={providers} />
    </div>
  );
}
