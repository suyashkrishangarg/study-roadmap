import { redirect } from "next/navigation";

export default async function AiSettingsRedirect() {
  redirect("/admin");
}
