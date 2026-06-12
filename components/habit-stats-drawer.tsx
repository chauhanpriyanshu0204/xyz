"use client"

import { useEffect } from "react"
import {
  type Habit,
  bestStreak,
  completionPercent,
  countDone,
  currentStreak,
  monthDays,
  motivation,
  weekDays,
} from "@/lib/habits"
import { ProgressBar } from "@/components/progress-bar"

type HabitStatsDrawerProps = {
  habit: Habit | null
  onClose: () => void
}

export function HabitStatsDrawer({ habit, onClose }: HabitStatsDrawerProps) {
  // Close on Escape key.
  useEffect(() => {
    if (!habit) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [habit, onClose])

  const open = habit !== null

  const today = new Date()
  const week = habit ? countDone(habit, weekDays(today)) : 0
  const monthRange = monthDays(today)
  const month = habit ? countDone(habit, monthRange) : 0
  const monthTotal = monthRange.length
  const monthPercent = completionPercent(month, monthTotal)
  const mood = motivation(monthPercent)
  const current = habit ? currentStreak(habit) : 0
  const best = habit ? bestStreak(habit) : 0

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close stats"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40"
      />

      {/* Panel — slides up on mobile, centered card on larger screens */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={habit ? `Stats for ${habit.name}` : "Habit stats"}
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:my-auto sm:mr-4 sm:h-fit sm:rounded-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-8"
        }`}
      >
        <div className="notebook-paper relative max-h-[85vh] overflow-y-auto rounded-t-2xl px-6 py-6 sm:rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base text-muted-foreground">Habit stats</p>
              <h2 className="font-hand text-4xl leading-tight text-primary">{habit?.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md border-2 border-border px-2 py-0.5 text-lg text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              ✕
            </button>
          </div>

          {/* Score cards */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatCard label="This week" value={`${week}/7`} />
            <StatCard label="This month" value={`${month}/${monthTotal}`} />
            <StatCard label="Current streak" value={current > 0 ? `🔥 ${current}` : "—"} />
            <StatCard label="Best streak ever" value={best > 0 ? `🏆 ${best}` : "—"} />
          </div>

          {/* Monthly completion */}
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-base text-muted-foreground">Monthly completion</span>
              <span className="text-lg text-primary">{monthPercent}%</span>
            </div>
            <ProgressBar percent={monthPercent} tone={mood.tone} />
            <p className="mt-2 text-lg text-foreground">
              {mood.emoji} {mood.label}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/30 px-3 py-2.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl text-foreground">{value}</p>
    </div>
  )
}
