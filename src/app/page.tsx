import { GraduationCap } from "@phosphor-icons/react/ssr";

export default function HomePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap size={28} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl tracking-tighter md:text-5xl">Study</h1>
          <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
            Plan, track, and gamify exam preparation with your friends.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Shared workspace for roadmaps, tasks, check-ins, quizzes, and
          analytics.
        </p>
      </div>
    </main>
  );
}
