"use client"

import { useMemo } from "react"
import {
  type Habit,
  currentStreak,
  dateKey,
  dayNumber,
  getStatus,
  isFuture,
  isSameDay,
  lastNDays,
  weekdayLabel,
} from "@/lib/habits"
import { HabitCell } from "@/components/habit-cell"
import { cn } from "@/lib/utils"

type HabitGridProps = {
  habits: Habit[]
  endDate: Date
  dayCount: number
  onToggle: (id: string, key: string) => void
  onRemove: (id: string) => void
  onOpenStats: (id: string) => void
}

export function HabitGrid({ habits, endDate, dayCount, onToggle, onRemove, onOpenStats }: HabitGridProps) {
  const days = useMemo(() => lastNDays(endDate, dayCount), [endDate, dayCount])
  const today = new Date()

  if (habits.length === 0) {
    return (
      <p className="py-10 text-center text-xl text-muted-foreground">
        No habits yet — jot one down above to begin your diary. ✎
      </p>
    )
  }

  return (
    <div className="-mx-2 overflow-x-auto px-2 pb-2">
      <table className="w-full border-separate border-spacing-y-1">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-paper/95 pr-3 text-left align-bottom" scope="col">
              <span className="text-base text-muted-foreground">Habit</span>
            </th>
            {days.map((d) => {
              const isToday = isSameDay(d, today)
              return (
                <th key={dateKey(d)} scope="col" className="px-0.5 align-bottom font-normal">
                  <div
                    className={cn(
                      "flex flex-col items-center leading-none",
                      isToday ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <span className="text-xs uppercase tracking-wide">{weekdayLabel(d)}</span>
                    <span className={cn("text-lg", isToday && "font-bold")}>{dayNumber(d)}</span>
                  </div>
                </th>
              )
            })}
            <th scope="col" className="pl-3 text-right align-bottom">
              <span className="text-base text-muted-foreground">Streak</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => {
            const streak = currentStreak(habit)
            return (
              <tr key={habit.id} className="group">
                <th
                  scope="row"
                  className="sticky left-0 z-10 max-w-[40vw] bg-paper/95 pr-3 text-left font-normal"
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onRemove(habit.id)}
                      aria-label={`Delete habit ${habit.name}`}
                      className="shrink-0 text-muted-foreground/50 opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                    <span className="truncate text-xl text-foreground" title={habit.name}>
                      <button
                        type="button"
                        onClick={() => onOpenStats(habit.id)}
                        className="truncate underline decoration-dotted decoration-1 underline-offset-4 hover:text-primary"
                      >
                        {habit.name}
                      </button>
                    </span>
                  </div>
                </th>
                {days.map((d) => {
                  const key = dateKey(d)
                  const future = isFuture(d)
                  return (
                    <td key={key} className="px-0.5 text-center">
                      <div className="flex justify-center">
                        <HabitCell
                          status={getStatus(habit, key)}
                          disabled={future}
                          onClick={() => onToggle(habit.id, key)}
                          label={`${habit.name} on ${key}`}
                        />
                      </div>
                    </td>
                  )
                })}
                <td className="whitespace-nowrap pl-3 text-right">
                  <span className={cn("text-lg", streak > 0 ? "text-accent" : "text-muted-foreground/60")}>
                    {streak > 0 ? `🔥 ${streak}` : "—"}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
