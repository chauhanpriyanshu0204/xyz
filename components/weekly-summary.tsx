"use client"

import { useMemo } from "react"
import {
  type Habit,
  completionPercent,
  countDone,
  dateKey,
  dayNumber,
  getStatus,
  isFuture,
  isSameDay,
  motivation,
  weekDays,
  weekdayLabel,
} from "@/lib/habits"
import { ProgressBar } from "@/components/progress-bar"
import { cn } from "@/lib/utils"

type WeeklySummaryProps = {
  habits: Habit[]
  onOpenStats: (id: string) => void
}

export function WeeklySummary({ habits, onOpenStats }: WeeklySummaryProps) {
  const today = new Date()
  const days = useMemo(() => weekDays(today), [today])

  if (habits.length === 0) {
    return (
      <p className="py-10 text-center text-xl text-muted-foreground">
        No habits to summarize yet. Add one to see your week unfold. ✎
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-base text-muted-foreground">This week · Mon → Sun</p>
      <ul className="flex flex-col gap-4">
        {habits.map((habit) => {
          const done = countDone(habit, days)
          const percent = completionPercent(done, 7)
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
                  {done}/7 days ✅
                </span>
              </div>

              {/* Mini week grid */}
              <div className="mt-2 flex items-end gap-1">
                {days.map((d) => {
                  const status = getStatus(habit, dateKey(d))
                  const future = isFuture(d)
                  const isToday = isSameDay(d, today)
                  return (
                    <div key={dateKey(d)} className="flex flex-1 flex-col items-center gap-1">
                      <span
                        className={cn(
                          "text-xs uppercase",
                          isToday ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {weekdayLabel(d).slice(0, 1)}
                      </span>
                      <div
                        aria-label={`${weekdayLabel(d)} ${dayNumber(d)}: ${status}`}
                        className={cn(
                          "flex h-8 w-full items-center justify-center rounded-md border text-base leading-none",
                          isToday ? "border-primary/60" : "border-border/60",
                          future && "opacity-40",
                          status === "done" && "bg-primary/15 text-primary",
                          status === "missed" && "bg-accent/15 text-accent",
                          status === "empty" && "text-muted-foreground/40",
                        )}
                      >
                        {status === "done" ? "✓" : status === "missed" ? "✕" : "·"}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <ProgressBar percent={percent} tone={mood.tone} className="flex-1" />
                <span className="shrink-0 whitespace-nowrap text-base text-muted-foreground">
                  {mood.emoji} {mood.label}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
