"use client"

import { useState } from "react"
import { type CellStatus, type Habit, dateKey, getStatus } from "@/lib/habits"
import { cn } from "@/lib/utils"

type FloatingWidgetProps = {
  habits: Habit[]
  onToggle: (id: string, key: string, force?: CellStatus) => void
}

export function FloatingWidget({ habits, onToggle }: FloatingWidgetProps) {
  const [expanded, setExpanded] = useState(false)
  const todayKey = dateKey(new Date())

  const doneCount = habits.filter((h) => getStatus(h, todayKey) === "done").length
  const total = habits.length

  // Collapsed: small floating icon button
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={`Open quick tracker — ${doneCount} of ${total} done today`}
        className="notebook-paper fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-border/60 text-center transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-6 sm:right-6"
      >
        <span className="font-hand text-xl leading-none text-primary">
          {total > 0 ? `${doneCount}/${total}` : "📝"}
        </span>
      </button>
    )
  }

  // Expanded: paper card with today's habits
  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(20rem,calc(100vw-2rem))] sm:bottom-6 sm:right-6">
      <div className="notebook-paper relative max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 px-4 py-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-hand text-2xl leading-none text-primary">Today</p>
            <p className="mt-0.5 text-base text-muted-foreground">
              {total > 0 ? `${doneCount}/${total} done ${doneCount === total ? "🎉" : "✅"}` : "No habits yet"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Minimize widget"
            className="rounded-md border-2 border-border px-2 py-0.5 text-lg text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            —
          </button>
        </div>

        {/* Today's habits with quick toggles */}
        {total > 0 ? (
          <ul className="mt-3 divide-y divide-dashed divide-border/60">
            {habits.map((habit) => {
              const status = getStatus(habit, todayKey)
              return (
                <li key={habit.id} className="flex items-center justify-between gap-2 py-2">
                  <span
                    className={cn(
                      "truncate text-lg",
                      status === "done" ? "text-foreground line-through decoration-primary/60" : "text-foreground",
                    )}
                  >
                    {habit.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggle(habit.id, todayKey, status === "done" ? "empty" : "done")}
                      aria-label={`Mark ${habit.name} as done`}
                      aria-pressed={status === "done"}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md border text-lg transition-colors",
                        status === "done"
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/60 text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggle(habit.id, todayKey, status === "missed" ? "empty" : "missed")}
                      aria-label={`Mark ${habit.name} as missed`}
                      aria-pressed={status === "missed"}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md border text-lg transition-colors",
                        status === "missed"
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-border/60 text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-4 text-center text-base text-muted-foreground">
            Add a habit to start tracking.
          </p>
        )}
      </div>
    </div>
  )
}
