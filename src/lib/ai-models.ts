export const AI_MODELS = [
  {
    id: "gemini-flash-lite-latest",
    label: "Flash Lite",
    hint: "Fastest · auto-updates",
  },
  {
    id: "gemini-flash-latest",
    label: "Flash",
    hint: "Smartest · auto-updates",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Flash Lite 2.5",
    hint: "Pinned fallback",
  },
] as const;

export type AiModelId = (typeof AI_MODELS)[number]["id"];

export const DEFAULT_AI_MODEL: AiModelId = "gemini-flash-lite-latest";

export function isAiModelId(value: unknown): value is AiModelId {
  return AI_MODELS.some((m) => m.id === value);
}
