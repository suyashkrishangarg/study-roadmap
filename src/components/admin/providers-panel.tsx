"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSimple, Plus, Power, Trash } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createProvider,
  deleteProvider,
  updateProvider,
} from "@/server-actions/ai-providers";
import type { ProviderSafe } from "@/lib/ai-providers";

const PRESETS = [
  { name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
  { name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai" },
  { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1" },
  { name: "Groq", baseUrl: "https://api.groq.com/openai/v1" },
  { name: "Together", baseUrl: "https://api.together.xyz/v1" },
  { name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1" },
  { name: "Mistral", baseUrl: "https://api.mistral.ai/v1" },
  { name: "xAI", baseUrl: "https://api.x.ai/v1" },
  { name: "Custom", baseUrl: "" },
];

export function ProvidersPanel({
  initialProviders,
}: {
  initialProviders: ProviderSafe[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [preset, setPreset] = useState("Custom");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  function applyPreset(label: string) {
    setPreset(label);
    const found = PRESETS.find((p) => p.name === label);
    if (!found) return;
    setName(label === "Custom" ? "" : found.name);
    setBaseUrl(found.baseUrl);
  }

  async function handleAdd() {
    setPending(true);
    setError(null);
    const result = await createProvider({ name, baseUrl, apiKey });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setBaseUrl("");
    setApiKey("");
    setPreset("Custom");
    router.refresh();
  }

  async function handleToggle(p: ProviderSafe) {
    setBusyId(p.id);
    await updateProvider(p.id, { enabled: !p.enabled });
    setBusyId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this provider? Its models will disappear from pickers.")) return;
    setBusyId(id);
    await deleteProvider(id);
    setBusyId(null);
    router.refresh();
  }

  async function handleKeySave(id: string) {
    if (!editKey.trim()) {
      setEditingId(null);
      return;
    }
    setBusyId(id);
    const result = await updateProvider(id, { apiKey: editKey });
    setBusyId(null);
    setEditingId(null);
    setEditKey("");
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a provider</CardTitle>
          <CardDescription>
            Keys are encrypted with AES-256-GCM before they touch the database,
            and never leave the server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="provider-preset">Preset</Label>
              <select
                id="provider-preset"
                value={preset}
                onChange={(e) => applyPreset(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="provider-name">Name</Label>
              <Input
                id="provider-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. OpenAI"
                maxLength={80}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="provider-url">Base URL</Label>
              <Input
                id="provider-url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="provider-key">API key</Label>
              <Input
                id="provider-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-…"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            type="button"
            className="mt-4"
            disabled={pending || !name.trim() || !baseUrl.trim() || !apiKey.trim()}
            onClick={() => void handleAdd()}
          >
            <Plus size={15} strokeWidth={1.5} aria-hidden="true" />
            {pending ? "Adding…" : "Add provider"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {initialProviders.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No custom providers yet</CardTitle>
              <CardDescription>
                The built-in Google models always work. Add OpenAI, OpenRouter,
                Groq, or any OpenAI-compatible endpoint above.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          initialProviders.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{p.name}</span>
                    <Badge variant={p.enabled ? "default" : "secondary"}>
                      {p.enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {p.baseUrl}
                  </p>
                  {editingId === p.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="password"
                        value={editKey}
                        onChange={(e) => setEditKey(e.target.value)}
                        placeholder="New API key…"
                        className="h-8 max-w-64"
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="New API key"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={busyId === p.id}
                        onClick={() => void handleKeySave(p.id)}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setEditKey("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0"
                    disabled={busyId === p.id}
                    onClick={() => void handleToggle(p)}
                    aria-label={p.enabled ? `Disable ${p.name}` : `Enable ${p.name}`}
                  >
                    <Power size={15} strokeWidth={1.5} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditKey("");
                    }}
                    aria-label={`Replace API key for ${p.name}`}
                  >
                    <PencilSimple size={15} strokeWidth={1.5} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0 hover:text-destructive"
                    disabled={busyId === p.id}
                    onClick={() => void handleDelete(p.id)}
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash size={15} strokeWidth={1.5} aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}