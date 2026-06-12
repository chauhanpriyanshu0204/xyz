"use client"

import { cn } from "@/lib/utils"
import type { CellStatus } from "@/lib/habits"

type HabitCellProps = {
  status: CellStatus
  onClick: () => void
  disabled?: boolean
  label: string
  size?: "sm" | "lg"
}

export function HabitCell({ status, onClick, disabled, label, size = "sm" }: HabitCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={status !== "empty"}
      className={cn(
        "flex items-center justify-center rounded-md border border-border/60 leading-none transition-colors",
        "hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        size === "sm" ? "h-9 w-9 text-lg" : "h-12 w-12 text-2xl",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
        status === "done" && "bg-primary/10",
        status === "missed" && "bg-accent/10",
      )}
    >
      {status === "done" && (
        <span aria-hidden className="text-primary">
          ✓
        </span>
      )}
      {status === "missed" && (
        <span aria-hidden className="text-accent">
          ✕
        </span>
      )}
      {status === "empty" && <span aria-hidden className="text-muted-foreground/30">·</span>}
    </button>
  )
}
