"use client"

import {
  type Habit,
  addDays,
  currentStreak,
  dateKey,
  getStatus,
  isFuture,
  isSameDay,
  longDate,
  parseDateKey,
} from "@/lib/habits"
import { HabitCell } from "@/components/habit-cell"
import { cn } from "@/lib/utils"

type DayHistoryProps = {
  habits: Habit[]
  selected: Date
  onSelect: (date: Date) => void
  onToggle: (id: string, key: string) => void
  onOpenStats: (id: string) => void
}

export function DayHistory({ habits, selected, onSelect, onToggle, onOpenStats }: DayHistoryProps) {
  const today = new Date()
  const selectedKey = dateKey(selected)
  const canGoForward = !isSameDay(selected, today) && !isFuture(selected)

  const doneCount = habits.filter((h) => getStatus(h, selectedKey) === "done").length

  return (
    <div>
      {/* Date navigator */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(addDays(selected, -1))}
          aria-label="Previous day"
          className="rounded-md border-2 border-border px-3 py-1 text-lg text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          ‹ Prev
        </button>

        <div className="flex flex-col items-center text-center">
          <input
            type="date"
            value={selectedKey}
            max={dateKey(today)}
            onChange={(e) => {
              if (e.target.value) onSelect(parseDateKey(e.target.value))
            }}
            aria-label="Pick a date"
            className="bg-transparent text-center text-lg text-primary focus:outline-none"
          />
          <span className="text-base text-muted-foreground">{longDate(selected)}</span>
        </div>

        <button
          type="button"
          onClick={() => onSelect(addDays(selected, 1))}
          disabled={!canGoForward}
          aria-label="Next day"
          className={cn(
            "rounded-md border-2 border-border px-3 py-1 text-lg text-foreground transition-colors hover:border-primary hover:text-primary",
            !canGoForward && "cursor-not-allowed opacity-40 hover:border-border hover:text-foreground",
          )}
        >
          Next ›
        </button>
      </div>

      {habits.length === 0 ? (
        <p className="py-10 text-center text-xl text-muted-foreground">
          No habits to show. Add one from the grid view first.
        </p>
      ) : (
        <>
          <p className="mb-3 text-center text-lg text-muted-foreground">
            {doneCount} of {habits.length} done {isSameDay(selected, today) ? "today" : "this day"}
          </p>
          <ul className="flex flex-col gap-1">
            {habits.map((habit) => {
              const status = getStatus(habit, selectedKey)
              const streak = currentStreak(habit)
              return (
                <li
                  key={habit.id}
                  className="flex items-center justify-between gap-3 border-b border-dashed border-border/60 py-2"
                >
                  <div className="flex min-w-0 flex-col">
                    <button
                      type="button"
                      onClick={() => onOpenStats(habit.id)}
                      className="truncate text-left text-xl text-foreground underline decoration-dotted decoration-1 underline-offset-4 hover:text-primary"
                    >
                      {habit.name}
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {status === "done" && "Completed ✓"}
                      {status === "missed" && "Missed ✕"}
                      {status === "empty" && "Not logged"}
                      {streak > 0 && ` · 🔥 ${streak}`}
                    </span>
                  </div>
                  <HabitCell
                    size="lg"
                    status={status}
                    onClick={() => onToggle(habit.id, selectedKey)}
                    label={`${habit.name} on ${selectedKey}`}
                  />
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
