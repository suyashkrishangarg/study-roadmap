"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuiz } from "@/server-actions/quizzes";
import { generateQuizFromTopic } from "@/server-actions/ai-generation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModelPicker } from "@/components/ai/model-picker";
import { DEFAULT_MODEL_ID } from "@/lib/ai-models";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkle, Trash, X } from "@phosphor-icons/react/ssr";
import type { QuestionType } from "@prisma/client";

type QuestionDraft = {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

function newQuestion(type: QuestionType = "mcq"): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    type,
    prompt: "",
    options: type === "mcq" ? ["", ""] : [],
    answer: "",
    explanation: "",
  };
}

const TEMPLATE_QUESTIONS: QuestionDraft[] = [
  {
    id: crypto.randomUUID(),
    type: "mcq",
    prompt: "What is the most effective way to retain new material long-term?",
    options: [
      "Re-reading notes multiple times",
      "Active recall and spaced repetition",
      "Highlighting key sentences",
      "Listening to music while studying",
    ],
    answer: "Active recall and spaced repetition",
    explanation:
      "Active recall (testing yourself) and spaced repetition (reviewing at increasing intervals) are the two highest-evidence study techniques.",
  },
  {
    id: crypto.randomUUID(),
    type: "true_false",
    prompt: "Cramming all study time into one session is more effective than spacing it out.",
    options: [],
    answer: "False",
    explanation:
      "Spacing study sessions (distributed practice) beats massed practice (cramming) for long-term retention.",
  },
  {
    id: crypto.randomUUID(),
    type: "short_answer",
    prompt: "Name one technique for checking your own understanding of a topic.",
    options: [],
    answer: "active recall",
    explanation:
      "Examples: self-testing, flashcards, practice questions, teaching the material to someone else.",
  },
];

export function QuizFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);

  const [aiTopic, setAiTopic] = useState("");
  const [aiNotes, setAiNotes] = useState("");
  const [aiModel, setAiModel] = useState<string>(DEFAULT_MODEL_ID);
  const [aiPending, setAiPending] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setTopic("");
    setQuestions([newQuestion()]);
    setError(null);
    setAiError(null);
  }

  function updateQuestion(id: string, patch: Partial<QuestionDraft>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  }

  function setQuestionType(id: string, type: QuestionType) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              type,
              options: type === "mcq" ? ["", ""] : [],
              answer: type === "true_false" ? "" : q.answer,
            }
          : q,
      ),
    );
  }

  function setOption(id: string, index: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              options: q.options.map((o, i) => (i === index ? value : o)),
            }
          : q,
      ),
    );
  }

  function addOption(id: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  }

  function removeOption(id: string, index: number) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              options: q.options.filter((_, i) => i !== index),
              answer:
                q.answer === q.options[index] ? "" : q.answer,
            }
          : q,
      ),
    );
  }

  async function handleGenerate() {
    const t = aiTopic.trim();
    if (!t) {
      setAiError("Enter a topic to generate from.");
      return;
    }
    setAiPending(true);
    setAiError(null);
    const result = await generateQuizFromTopic({ topic: t, notes: aiNotes, model: aiModel });
    setAiPending(false);
    if (!result.ok) {
      setAiError(result.error);
      return;
    }
    setTitle(result.data.title);
    setTopic(t);
    setQuestions(
      result.data.questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        options: (q.options as string[] | null) ?? [],
        answer: q.answer,
        explanation: q.explanation ?? "",
      })),
    );
  }

  async function handleSubmit() {
    setPending(true);
    setError(null);

    const payload = {
      title,
      description: description || null,
      topic: topic || null,
      source: "manual" as const,
      questions: questions
        .filter((q) => q.prompt.trim() && q.answer.trim())
        .map((q) => ({
          type: q.type,
          prompt: q.prompt,
          options:
            q.type === "mcq"
              ? q.options.map((o) => o.trim()).filter(Boolean)
              : null,
          answer: q.answer,
          explanation: q.explanation || null,
        })),
    };

    const result = await createQuiz(payload);
    setPending(false);
    if (result.ok) {
      reset();
      onOpenChange(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New quiz</DialogTitle>
          <DialogDescription>
            Add questions manually, load a template, or generate with AI.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="quiz-title">Title</Label>
              <Input
                id="quiz-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="e.g. Chapter 3 review"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="quiz-topic">
                Topic <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="quiz-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={120}
                placeholder="e.g. Algebra"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="quiz-description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="quiz-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="What is this quiz for?"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuestions(TEMPLATE_QUESTIONS.map((q) => ({ ...q, id: crypto.randomUUID() })))}
            >
              Load template
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuestions([...questions, newQuestion()])}
            >
              <Plus size={14} strokeWidth={1.5} aria-hidden="true" />
              Add question
            </Button>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Sparkle size={15} strokeWidth={1.5} aria-hidden="true" />
              Generate with AI
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ai-topic">Topic</Label>
                <Input
                  id="ai-topic"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  maxLength={120}
                  placeholder="e.g. Photosynthesis"
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ai-notes">
                  Notes <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="ai-notes"
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  rows={2}
                  maxLength={2000}
                  placeholder="Paste class notes to base the quiz on"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Model</span>
                <ModelPicker value={aiModel} onChange={setAiModel} id="quiz-ai-model" />
              </div>
              {aiError && (
                <p className="text-sm text-destructive" role="alert">
                  {aiError}
                </p>
              )}
              <Button
                type="button"
                size="sm"
                onClick={handleGenerate}
                disabled={aiPending}
              >
                {aiPending ? "Generating…" : "Generate quiz"}
              </Button>
              <p className="text-xs text-muted-foreground">
                AI generation is limited to 5 quizzes per day.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="flex flex-col gap-3 rounded-md border border-border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">Question {index + 1}</Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 px-0 hover:text-destructive"
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.filter((q) => q.id !== question.id),
                        )
                      }
                      disabled={questions.length === 1}
                      aria-label="Remove question"
                    >
                      <Trash size={14} strokeWidth={1.5} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`type-${question.id}`}>Type</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value) =>
                        setQuestionType(question.id, value as QuestionType)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple choice</SelectItem>
                        <SelectItem value="true_false">True / False</SelectItem>
                        <SelectItem value="short_answer">Short answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`answer-${question.id}`}>Answer</Label>
                    {question.type === "mcq" ? (
                      <Select
                        value={question.answer}
                        onValueChange={(value) =>
                          updateQuestion(question.id, { answer: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pick an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options
                            .map((o) => o.trim())
                            .filter(Boolean)
                            .map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : question.type === "true_false" ? (
                      <Select
                        value={question.answer}
                        onValueChange={(value) =>
                          updateQuestion(question.id, { answer: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pick" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="True">True</SelectItem>
                          <SelectItem value="False">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={`answer-${question.id}`}
                        value={question.answer}
                        onChange={(e) =>
                          updateQuestion(question.id, { answer: e.target.value })
                        }
                        placeholder="Accepted answer"
                        autoComplete="off"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`prompt-${question.id}`}>Prompt</Label>
                  <Textarea
                    id={`prompt-${question.id}`}
                    value={question.prompt}
                    onChange={(e) =>
                      updateQuestion(question.id, { prompt: e.target.value })
                    }
                    rows={2}
                    maxLength={2000}
                    placeholder="The question"
                  />
                </div>
                {question.type === "mcq" && (
                  <div className="flex flex-col gap-2">
                    <Label>Options</Label>
                    <div className="flex flex-col gap-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) =>
                              setOption(question.id, optionIndex, e.target.value)
                            }
                            maxLength={500}
                            placeholder={`Option ${optionIndex + 1}`}
                            autoComplete="off"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 shrink-0 px-0 hover:text-destructive"
                            onClick={() => removeOption(question.id, optionIndex)}
                            disabled={question.options.length <= 2}
                            aria-label="Remove option"
                          >
                            <X size={14} strokeWidth={1.5} aria-hidden="true" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={() => addOption(question.id)}
                      >
                        <Plus size={14} strokeWidth={1.5} aria-hidden="true" />
                        Add option
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`explanation-${question.id}`}>
                    Explanation{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id={`explanation-${question.id}`}
                    value={question.explanation}
                    onChange={(e) =>
                      updateQuestion(question.id, { explanation: e.target.value })
                    }
                    rows={2}
                    maxLength={2000}
                    placeholder="Why the answer is correct"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending ? "Creating…" : "Create quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
