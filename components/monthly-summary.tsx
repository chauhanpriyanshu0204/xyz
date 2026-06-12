"use client"

import { useMemo } from "react"
import {
  type Habit,
  completionPercent,
  countDone,
  monthDays,
  monthName,
  motivation,
} from "@/lib/habits"
import { ProgressBar } from "@/components/progress-bar"

type MonthlySummaryProps = {
  habits: Habit[]
  onOpenStats: (id: string) => void
}

export function MonthlySummary({ habits, onOpenStats }: MonthlySummaryProps) {
  const today = new Date()
  const days = useMemo(() => monthDays(today), [today])
  const totalDays = days.length

  if (habits.length === 0) {
    return (
      <p className="py-10 text-center text-xl text-muted-foreground">
        No habits to summarize yet. Add one to track your month. ✎
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-base text-muted-foreground">{monthName(today)}</p>
      <ul className="flex flex-col gap-4">
        {habits.map((habit) => {
          const done = countDone(habit, days)
          const percent = completionPercent(done, totalDays)
          const mood = motivation(percent)
          return (
            <li key={habit.id} className="border-b border-dashed border-border/60 pb-4">
              <div className="flex items-baseline justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpenStats(habit.id)}
                  className="truncate text-xl text-foreground underline decoration-dotted decoration-1 underline-offset-4 hover:text-primary"
                  title={`See stats for ${habit.name}`}
                >
                  {habit.name}
                </button>
                <span className="shrink-0 whitespace-nowrap text-lg text-accent">
                  {done}/{totalDays} days {percent > 70 ? "🔥" : ""}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <ProgressBar percent={percent} tone={mood.tone} className="flex-1" />
                <span className="shrink-0 whitespace-nowrap text-lg text-primary">{percent}%</span>
              </div>

              <p className="mt-1.5 text-base text-muted-foreground">
                {mood.emoji} {mood.label}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
