"use client"

import { useMemo, useState } from "react"
import { useHabits } from "@/hooks/use-habits"
import { useSettings } from "@/hooks/use-settings"
import { useReminder } from "@/hooks/use-reminder"
import { AddHabitForm } from "@/components/add-habit-form"
import { HabitGrid } from "@/components/habit-grid"
import { DayHistory } from "@/components/day-history"
import { WeeklySummary } from "@/components/weekly-summary"
import { MonthlySummary } from "@/components/monthly-summary"
import { HabitStatsDrawer } from "@/components/habit-stats-drawer"
import { SettingsPanel } from "@/components/settings-panel"
import { FloatingWidget } from "@/components/floating-widget"
import { longDate } from "@/lib/habits"
import { cn } from "@/lib/utils"

type View = "grid" | "day" | "week" | "month" | "settings"

const TABS: { id: View; label: string }[] = [
  { id: "grid", label: "Grid" },
  { id: "day", label: "Day" },
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
  { id: "settings", label: "Settings" },
]

export default function Page() {
  const { habits, loaded, addHabit, removeHabit, toggleCell } = useHabits()
  const { settings, loaded: settingsLoaded, update, setHabitNotify } = useSettings()
  const { permission, requestPermission } = useReminder(settings, settingsLoaded)
  const [view, setView] = useState<View>("grid")
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date())
  const [statsId, setStatsId] = useState<string | null>(null)
  const today = new Date()

  const statsHabit = useMemo(
    () => habits.find((h) => h.id === statsId) ?? null,
    [habits, statsId],
  )

  return (
    <main className="desk-surface min-h-screen w-full px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="notebook-paper notebook-margin relative rounded-sm px-4 py-6 pl-12 sm:px-8 sm:py-8 sm:pl-16">
          {/* Header */}
          <header className="mb-6">
            <h1 className="font-hand text-5xl leading-none text-primary sm:text-6xl">My Habit Diary</h1>
            <p className="mt-1 text-lg text-muted-foreground">{longDate(today)}</p>
          </header>

          {/* Add habit */}
          <section className="mb-6">
            <AddHabitForm onAdd={addHabit} />
          </section>

          {/* View tabs */}
          <div className="mb-5 flex flex-wrap items-center gap-1 border-b-2 border-dashed border-border pb-2">
            {TABS.map((tab) => (
              <ViewTab key={tab.id} active={view === tab.id} onClick={() => setView(tab.id)}>
                {tab.label}
              </ViewTab>
            ))}
            <span className="ml-auto text-base text-muted-foreground">
              {habits.length} {habits.length === 1 ? "habit" : "habits"}
            </span>
          </div>

          {/* Content */}
          {!loaded ? (
            <p className="py-10 text-center text-xl text-muted-foreground">Opening your diary…</p>
          ) : (
            <div key={view} className="tab-panel">
              {view === "grid" && (
                <>
                  <HabitGrid
                    habits={habits}
                    endDate={today}
                    dayCount={14}
                    onToggle={toggleCell}
                    onRemove={removeHabit}
                    onOpenStats={setStatsId}
                  />
                  <p className="mt-4 text-center text-sm text-muted-foreground/80">
                    Tap a box to cycle: empty → ✓ done → ✕ missed. Tap a habit name for stats.
                  </p>
                </>
              )}
              {view === "day" && (
                <DayHistory
                  habits={habits}
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  onToggle={toggleCell}
                  onOpenStats={setStatsId}
                />
              )}
              {view === "week" && <WeeklySummary habits={habits} onOpenStats={setStatsId} />}
              {view === "month" && <MonthlySummary habits={habits} onOpenStats={setStatsId} />}
              {view === "settings" && (
                <SettingsPanel
                  habits={habits}
                  settings={settings}
                  permission={permission}
                  onUpdate={update}
                  onSetHabitNotify={setHabitNotify}
                  onRequestPermission={requestPermission}
                />
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-base text-foreground/50">
          Saved automatically in your browser — your diary stays put after refresh.
        </p>
      </div>

      <HabitStatsDrawer habit={statsHabit} onClose={() => setStatsId(null)} />

      {settingsLoaded && settings.showWidget && (
        <FloatingWidget habits={habits} onToggle={toggleCell} />
      )}
    </main>
  )
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1 text-lg transition-colors",
        active
          ? "bg-primary/10 text-primary underline decoration-wavy decoration-1 underline-offset-4"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
