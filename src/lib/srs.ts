export type SrsGrade = "again" | "hard" | "good" | "easy";

const QUALITY: Record<SrsGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export type SrsState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export type SrsResult = SrsState & { dueDate: Date };

export function sm2(state: SrsState, grade: SrsGrade): SrsResult {
  const quality = QUALITY[grade];
  let { easeFactor, intervalDays, repetitions } = state;

  if (quality >= 3) {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.min(3.0, Math.max(1.3, Math.round(easeFactor * 100) / 100));

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + intervalDays);
  return { easeFactor, intervalDays, repetitions, dueDate };
}

export function nextIntervalLabel(state: SrsState, grade: SrsGrade): string {
  const { intervalDays } = sm2(state, grade);
  if (intervalDays < 1) return "today";
  if (intervalDays === 1) return "1 day";
  if (intervalDays < 30) return `${intervalDays} days`;
  const months = Math.round(intervalDays / 30);
  return months === 1 ? "1 month" : `${months} months`;
}
