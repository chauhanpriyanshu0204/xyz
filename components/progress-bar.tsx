"use client"

import { cn } from "@/lib/utils"

type ProgressBarProps = {
  percent: number
  tone?: "high" | "mid" | "low" | "primary"
  className?: string
}

const TONE_CLASS: Record<string, string> = {
  high: "bg-accent",
  mid: "bg-primary",
  low: "bg-muted-foreground",
  primary: "bg-primary",
}

export function ProgressBar({ percent, tone = "primary", className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full border border-border/60 bg-secondary/50",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500 ease-out", TONE_CLASS[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
