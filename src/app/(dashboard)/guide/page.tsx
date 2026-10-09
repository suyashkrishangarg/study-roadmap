import {
  Bell,
  BookOpen,
  Books,
  Rocket,
  CalendarBlank,
  ChartBarHorizontal,
  ChartPie,
  ChatCircleDots,
  Clock,
  CopySimple,
  Exam,
  Flag,
  House,
  Hourglass,
  ListChecks,
  MapTrifold,
  ShieldCheck,
  Sparkle,
  Target,
  Timer,
} from "@phosphor-icons/react/ssr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SECTIONS = [
  {
    icon: House,
    title: "Dashboard",
    route: "/",
    body: "Your morning view. Today minutes, streak, and active goals on top; 7-day study bars and 14-day task trend below; due tasks with one-click complete; quick check-in form; goal progress bars; invite code for friends.",
    pro: "Open this first every day. If the streak number moved, the system is working.",
    ai: ["What should I focus on today?", "What tasks are due this week?", "Create a weekly goal of 300 minutes"],
  },
  {
    icon: ListChecks,
    title: "Tasks",
    route: "/tasks",
    body: "Every to-do with deadline, priority, status, and assignee. Filter by due (today / week / overdue), status, priority, or just yours. Tasks can link to roadmap items so plans and dailies stay connected.",
    pro: "Filter assignee = me + due = week every Monday. Anything overdue gets rescheduled or deleted — never left rotting.",
    ai: ["Add a task: Study mathematics (2 hrs), due 10 October", "Mark my maths task done", "Delete all my completed tasks"],
  },
  {
    icon: MapTrifold,
    title: "Roadmaps",
    route: "/roadmaps",
    body: "Long-term plans broken into trackable items with status, progress %, dates, and assignees. Each roadmap is a card with a progress bar; open it for the full item list.",
    pro: "One roadmap per subject or exam. Items are chapters; progress % is honesty-checked against quiz scores.",
    ai: ["Create a roadmap for physics exam prep", "Add an item 'Thermodynamics' to my physics roadmap", "Delete the DELETE roadmap"],
  },
  {
    icon: Books,
    title: "Resources",
    route: "/resources",
    body: "Your full library of 298 curated courses, videos, docs and papers across 8 groups (Maths, CS, Programming, DSA, Classical ML, Deep Learning, RL, LLM Systems). Search and filter by group, level, and type.",
    pro: "Star the keepers as favorites, then attach any resource to a roadmap item so the plan and the material stay connected.",
    ai: ["What resources do I have for linear algebra?", "Show my favorite resources"],
  },
  {
    icon: Rocket,
    title: "Projects",
    route: "/projects",
    body: "Every build in your roadmap — 77 projects across DSA/Python, Classical ML, Reinforcement Learning, and LLM Systems, with stage, estimated hours, priority, and dependencies.",
    pro: "Star the projects you're committing to, then 'Add as task' to schedule one. The assistant can list them and add any to your tasks too.",
    ai: ["What projects do I have left?", "Add the RAG assistant project to my tasks", "Which LLM projects are Core priority?"],
  },
  {
    icon: ChartBarHorizontal,
    title: "Timeline",
    route: "/timeline",
    body: "A Gantt view of roadmap items — drag bars to reschedule. It shows roadmap dates; edits happen by dragging or via the assistant.",
    pro: "Drag the current week's bars every Sunday night so the timeline always reflects reality.",
    ai: ["Move 'Cell biology chapters' to next week", "What roadmap items are due this week?"],
  },
  {
    icon: CalendarBlank,
    title: "Calendar",
    route: "/calendar",
    body: "Task deadlines and roadmap due dates on a month grid. Click chips to jump to the source.",
    pro: "Scan the month view for collision weeks (3+ deadlines) and ask the assistant to spread them.",
    ai: ["What's on my calendar this week?", "Move my Friday deadline to Monday"],
  },
  {
    icon: Timer,
    title: "Check-ins",
    route: "/check-ins",
    body: "Attendance log: every study session with subject + minutes. Streak counts consecutive days with any check-in; the 26-week heatmap shows consistency at a glance.",
    pro: "Log immediately after studying — same subject name every time, or the heatmap fragments.",
    ai: ["I studied biology for 45 minutes", "How many minutes did I study this week?", "Delete my last check-in, I logged it twice"],
  },
  {
    icon: BookOpen,
    title: "Practice",
    route: "/practice",
    body: "A question bank by topic and difficulty with solutions and mastered tracking. Drill weak topics; mark questions mastered as they stick.",
    pro: "After every quiz, turn each wrong answer into a practice question here.",
    ai: ["Add a practice question on photosynthesis", "List my unmastered physics questions", "Mark that question mastered"],
  },
  {
    icon: Exam,
    title: "Quizzes",
    route: "/quizzes",
    body: "Graded assessments: manual, template, or AI-generated from a topic + notes. Take with auto-grading, attempt history, and per-topic accuracy that feeds the analytics radar.",
    pro: "Generate a 10-question quiz per chapter, take it closed-book, then check the radar for the weakest topic.",
    ai: ["Make a 10-question quiz on thermodynamics", "Delete the old algebra quiz", "Quiz me on cell biology right here"],
  },
  {
    icon: CopySimple,
    title: "Flashcards",
    route: "/flashcards",
    body: "SM-2 spaced repetition: review due cards, grade again/hard/good/easy, intervals adapt (1d, 6d, then ease x interval). Generate sets from any topic with AI.",
    pro: "Review mode daily — 10 minutes of due cards beats an hour of re-reading. Grade honestly.",
    ai: ["Make flashcards on French verbs", "What cards are due today?", "Grade that card as good"],
  },
  {
    icon: Hourglass,
    title: "Marathons",
    route: "/marathons",
    body: "Timed group focus sessions — scheduled or on-demand — with live countdown, running timer, per-member leaderboard, and completion rate. Finishing logs minutes to your check-ins automatically.",
    pro: "Run a 2-hour weekend marathon with the group; the leaderboard is the accountability.",
    ai: ["Create a 2-hour on-demand marathon for Saturday", "List upcoming marathons", "Delete the old marathon"],
  },
];

const MORE_SECTIONS: typeof SECTIONS = [
  {
    icon: ChartPie,
    title: "Analytics",
    route: "/analytics",
    body: "Subject-mastery radar (quiz + practice accuracy), SM-2 retention curve, 14-day activity polygraph (minutes / tasks / quiz %), group leaderboard, and 11 badges.",
    pro: "Check the radar weekly — the smallest wedge is next week's study priority.",
    ai: ["How am I doing in physics?", "Who's leading the group this week?"],
  },
  {
    icon: ChatCircleDots,
    title: "Assistant",
    route: "/assistant",
    body: "The LLM with hands on everything above: 39 tools across tasks, roadmaps, check-ins, goals, practice, quizzes (create/delete/grade), flashcards (create/delete/SM-2 grade), marathons (create/delete), notifications, and member lookup. Pick any configured model with search.",
    pro: "Talk in outcomes ('plan my week', 'clean up my old stuff') not button-clicks. It chains tools itself.",
    ai: ["Plan my study week", "Delete all my completed tasks", "Make a quiz on what I got wrong"],
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    route: "/admin",
    body: "Owner/admin console: member roles (admin/member), remove-from-workspace (content stays), permanent delete (double-confirmed), plus every OpenAI-compatible LLM provider with encrypted keys and live model discovery.",
    pro: "Invite with the dashboard code, promote your core group to admin, keep providers enabled-only for what you use.",
    ai: [],
  },
  {
    icon: Bell,
    title: "Notifications",
    route: "/",
    body: "The bell in the header: deadline warnings, marathon starts, quiz grades. Generated in the background, never blocking page loads; click a notification to jump to its source.",
    pro: "Clear the bell daily — an unread badge you ignore trains you to ignore all of them.",
    ai: ["What notifications do I have?", "Clear my notifications"],
  },
];

const WORKFLOWS = [
  {
    icon: Flag,
    title: "Exam in 4 weeks",
    steps: [
      "Ask the assistant: 'Create a roadmap for <exam> with a chapter per item, ending the week before the exam'.",
      "Generate a 10-question quiz per chapter; take each closed-book.",
      "Turn every wrong answer into a practice question + flashcard.",
      "Run weekend marathons with the group; watch the radar wedge grow.",
      "Final week: assistant 'quiz me on my weakest topic' daily.",
    ],
  },
  {
    icon: Clock,
    title: "Daily 30-minute habit",
    steps: [
      "Dashboard check-in immediately after studying — same subject names.",
      "Flashcards review mode: clear the due queue.",
      "Assistant 'what should I focus on today?' when undecided.",
      "Sunday: timeline drag + 'plan my study week'.",
    ],
  },
  {
    icon: Target,
    title: "Group accountability",
    steps: [
      "Everyone joins via invite code; promote the core to admin.",
      "Shared marathon every Saturday; leaderboard decides bragging rights.",
      "Compare analytics leaderboards Monday; lowest minutes picks next marathon topic.",
    ],
  },
];

export default function GuidePage() {
  const all = [...SECTIONS, ...MORE_SECTIONS];
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl tracking-tight md:text-3xl">Guide</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Every feature, how to use it to the fullest, and what the assistant
          can do for you on each page. Start with Dashboard, end with Admin.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {all.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon size={18} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-primary" />
                    <CardTitle className="truncate text-base">{s.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="shrink-0 font-mono text-[11px]">
                    {s.route}
                  </Badge>
                </div>
                <CardDescription className="leading-relaxed">{s.body}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm leading-relaxed">
                  <span className="font-medium">Use it well: </span>
                  {s.pro}
                </p>
                {s.ai.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Sparkle size={13} aria-hidden="true" />
                      Try asking the assistant
                    </span>
                    <ul className="flex flex-col gap-1">
                      {s.ai.map((ex) => (
                        <li key={ex} className="truncate font-mono text-xs text-muted-foreground">
                          “{ex}”
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div>
        <h2 className="text-xl tracking-tight">Power workflows</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Copy-paste playbooks that combine pages and the assistant.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {WORKFLOWS.map((w) => {
            const Icon = w.icon;
            return (
              <Card key={w.title}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon size={18} strokeWidth={1.5} aria-hidden="true" className="text-primary" />
                    <CardTitle className="text-base">{w.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed">
                    {w.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}