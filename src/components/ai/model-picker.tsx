"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CaretDown, Check, MagnifyingGlass, Spinner } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_MODEL_ID, type ModelEntry } from "@/lib/ai-models";

async function loadModels(): Promise<ModelEntry[]> {
  const res = await fetch("/api/ai-models", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { models?: ModelEntry[] };
  return Array.isArray(json.models) ? json.models : [];
}

export function ModelPicker({
  value,
  onChange,
  id,
  label = "Model",
}: {
  value: string;
  onChange: (id: string) => void;
  id?: string;
  label?: string;
}) {
  const autoId = useId();
  const inputId = id ?? `model-${autoId}`;
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<ModelEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setModels(await loadModels());
    } catch {
      setLoadError("Could not load models. Check providers in AI settings.");
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    setOpen((wasOpen) => {
      if (!wasOpen && models === null && !loading) void refresh();
      return !wasOpen;
    });
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open ]);

  const filtered = useMemo(() => {
    const list = models ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list.slice(0, 100);
    return list
      .filter(
        (m) =>
          m.label.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.hint.toLowerCase().includes(q),
      )
      .slice(0, 100);
  }, [models, query]);

  const selected = models?.find((m) => m.id === value);
  const selectedLabel = selected?.label ?? value.split(":").pop() ?? value;

  return (
    <div ref={boxRef} className="relative">
      <Label htmlFor={inputId} className="sr-only">
        {label}
      </Label>
      <Button
        id={inputId}
        type="button"
        variant="outline"
        size="sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleOpen}
        className="max-w-56 justify-between gap-2"
      >
        <span className="truncate">{loading && !models ? "Loading…" : selectedLabel}</span>
        {loading ? (
          <Spinner size={14} className="shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <CaretDown size={14} className="shrink-0" aria-hidden="true" />
        )}
      </Button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-72 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="border-b border-border p-2">
            <div className="relative">
              <MagnifyingGlass
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models…"
                aria-label="Search models"
                className="h-8 pl-8"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1" role="listbox" aria-label={label}>
            {loadError ? (
              <div className="flex flex-col gap-2 px-2 py-3 text-sm">
                <p className="text-destructive" role="alert">{loadError}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
                  Retry
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                {models === null ? "Loading models…" : "No models match."}
              </p>
            ) : (
              filtered.map((m) => {
                const active = m.id === value;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground",
                      active && "bg-accent/60",
                    )}
                  >
                    <Check
                      size={14}
                      aria-hidden="true"
                      className={cn("mt-0.5 shrink-0", active ? "opacity-100" : "opacity-0")}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{m.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{m.hint}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border px-2 py-1.5 text-xs text-muted-foreground">
            <span>{models ? `${models.length} models` : "Fetching from providers…"}</span>
            <button
              type="button"
              onClick={() => void refresh()}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_MODEL_ID };