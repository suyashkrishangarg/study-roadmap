"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import {
  Brain,
  CaretDown,
  CaretRight,
  CheckCircle,
  CircleDashed,
  PaperPlaneRight,
  Sparkle,
  Warning,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

const transport = new DefaultChatTransport({ api: "/api/assistant" });

const toolLabels: Record<string, string> = {
  getStudySummary: "Study summary",
  listTasks: "Listed tasks",
  createTask: "Created task",
  updateTask: "Updated task",
  deleteTask: "Deleted task",
  listRoadmaps: "Listed roadmaps",
  createRoadmap: "Created roadmap",
  updateRoadmap: "Updated roadmap",
  createRoadmapItem: "Added roadmap item",
  updateRoadmapItem: "Updated roadmap item",
  listCheckIns: "Listed check-ins",
  createCheckIn: "Logged study time",
  listGoals: "Listed goals",
  createGoal: "Created goal",
  listPracticeQuestions: "Listed practice questions",
  createPracticeQuestion: "Added practice question",
  listQuizzes: "Listed quizzes",
};

const suggestions = [
  "What should I focus on today?",
  "Add a task: study maths for 2 hours, due 10 October",
  "Log 45 minutes of biology",
  "What tasks are due this week?",
  "Create a weekly goal of 300 minutes",
];

type ToolCardPart = {
  type: string;
  toolName: string;
  toolCallId: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  state?: { state: string };
};

function isToolPart(part: unknown): part is ToolCardPart {
  if (typeof part !== "object" || part === null) return false;
  const type = (part as { type?: unknown }).type;
  return (
    typeof type === "string" &&
    (type === "dynamic-tool" || type.startsWith("tool-"))
  );
}

function summarize(output: unknown): string | null {
  if (typeof output !== "string") return null;
  try {
    const parsed = JSON.parse(output);
    if (parsed && typeof parsed === "object") {
      if (parsed.error) return parsed.error;
      if (parsed.created) {
        return (
          parsed.title ??
          parsed.goal ??
          parsed.topic ??
          parsed.subject ??
          "Done"
        );
      }
      if (parsed.updated) return parsed.title ?? "Updated";
      if (parsed.deleted) return parsed.title ?? "Deleted";
      if (parsed.logged)
        return `${parsed.subject} · ${parsed.durationMin} min`;
      if (parsed.tasks) return `${parsed.tasks.length} task(s)`;
      if (parsed.roadmaps) return `${parsed.roadmaps.length} roadmap(s)`;
      if (parsed.checkIns) return `${parsed.checkIns.length} session(s)`;
      if (parsed.goals) return `${parsed.goals.length} goal(s)`;
      if (parsed.questions) return `${parsed.questions.length} question(s)`;
      if (parsed.quizzes) return `${parsed.quizzes.length} quiz(zes)`;
      if (parsed.todayMinutes !== undefined)
        return `${parsed.todayMinutes} min today · streak ${parsed.streak}`;
    }
  } catch {
    return null;
  }
  return null;
}

function ToolCard({ part }: { part: ToolCardPart }) {
  const [expanded, setExpanded] = useState(false);
  const label = toolLabels[part.toolName] ?? part.toolName;
  const state = part.state?.state ?? "input-available";
  const done = state === "output-available";
  const failed = state === "output-error";
  const summary = done ? summarize(part.output) : null;

  return (
    <div className="rounded-md border border-border bg-muted/30">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs"
      >
        {done ? (
          <CheckCircle size={14} className="shrink-0 text-primary" aria-hidden="true" />
        ) : failed ? (
          <Warning size={14} className="shrink-0 text-destructive" aria-hidden="true" />
        ) : (
          <CircleDashed size={14} className="shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
        )}
        <span className="font-medium">{label}</span>
        {summary && (
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            {summary}
          </span>
        )}
        {failed && part.errorText && (
          <span className="min-w-0 flex-1 truncate text-destructive">
            {part.errorText}
          </span>
        )}
        {expanded ? (
          <CaretDown size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <CaretRight size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
      {expanded && (
        <pre className="max-h-48 overflow-auto border-t border-border px-3 py-2 text-xs text-muted-foreground">
          {done || failed
            ? typeof part.output === "string"
              ? part.output
              : JSON.stringify(part.output ?? part.errorText ?? null, null, 2)
            : JSON.stringify(part.input ?? null, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function AssistantClient() {
  const { messages, status, sendMessage, error } = useChat({
    transport,
  });
  const [input, setInput] = useState("");
  const isPending = status === "submitted" || status === "streaming";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isPending) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col gap-4">
      <div>
        <h1 className="text-2xl tracking-tight md:text-3xl">
          Study assistant
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Ask about your plan, or ask it to add tasks, log study time,
          update roadmaps, and more.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
        {messages.length === 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain size={18} strokeWidth={1.5} aria-hidden="true" />
                <CardTitle className="text-base">
                  Your AI study partner
                </CardTitle>
              </div>
              <CardDescription>
                It can see your tasks, roadmaps, check-ins, goals, practice
                questions, and quizzes — and edit them on request.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="rounded-md border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-2",
                message.role === "user" ? "items-end" : "items-start",
              )}
            >
              <Badge
                variant={message.role === "user" ? "default" : "secondary"}
                className="w-fit"
              >
                {message.role === "user" ? "You" : "Assistant"}
              </Badge>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg border px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "border-primary/30 bg-primary/10"
                    : "border-border bg-card",
                )}
              >
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return (
                      <p key={index} className="whitespace-pre-wrap">
                        {part.text}
                      </p>
                    );
                  }
                  if (isToolPart(part)) {
                    return (
                      <div key={index} className="mt-2">
                        <ToolCard part={part} />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))
        )}
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkle size={15} className="animate-pulse" aria-hidden="true" />
            Thinking…
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-lg border border-border bg-card p-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask about your study plan, or ask it to change something…"
          rows={1}
          className="max-h-32 min-h-10 resize-none"
          autoComplete="off"
        />
        <Button type="submit" disabled={isPending || !input.trim()}>
          <PaperPlaneRight size={16} strokeWidth={1.5} aria-hidden="true" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
