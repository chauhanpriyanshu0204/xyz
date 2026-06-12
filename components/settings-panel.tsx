"use client"

import { useState } from "react"
import type { Habit } from "@/lib/habits"
import { type Settings, formatTime12h, isHabitNotifyOn } from "@/lib/settings"
import { sendTestReminder } from "@/hooks/use-reminder"
import { cn } from "@/lib/utils"

type Permission = "default" | "granted" | "denied" | "unsupported"

type SettingsPanelProps = {
  habits: Habit[]
  settings: Settings
  permission: Permission
  onUpdate: (patch: Partial<Settings>) => void
  onSetHabitNotify: (habitId: string, enabled: boolean) => void
  onRequestPermission: () => Promise<Permission>
}

export function SettingsPanel({
  habits,
  settings,
  permission,
  onUpdate,
  onSetHabitNotify,
  onRequestPermission,
}: SettingsPanelProps) {
  const [testMsg, setTestMsg] = useState<string | null>(null)

  const handleEnableToggle = async (next: boolean) => {
    if (next && permission !== "granted") {
      const result = await onRequestPermission()
      if (result !== "granted") {
        onUpdate({ notificationsEnabled: false })
        return
      }
    }
    onUpdate({ notificationsEnabled: next })
  }

  const handleTest = () => {
    const ok = sendTestReminder()
    setTestMsg(ok ? "Sent! Check your notifications." : "Enable notifications first.")
    setTimeout(() => setTestMsg(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Daily reminder section */}
      <section className="rounded-lg border border-border/60 bg-secondary/20 p-4">
        <h2 className="font-hand text-3xl text-primary">Daily Reminder</h2>
        <p className="mt-1 text-base text-muted-foreground">
          Get a gentle nudge to log your habits each day.
        </p>

        {permission === "unsupported" && (
          <p className="mt-3 rounded-md bg-accent/10 px-3 py-2 text-base text-accent">
            Your browser doesn&apos;t support notifications.
          </p>
        )}
        {permission === "denied" && (
          <p className="mt-3 rounded-md bg-accent/10 px-3 py-2 text-base text-accent">
            Notifications are blocked. Enable them in your browser settings to use reminders.
          </p>
        )}

        {/* Global toggle */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xl text-foreground">Enable reminders</p>
            <p className="text-sm text-muted-foreground">Turn daily notifications on or off.</p>
          </div>
          <ToggleSwitch
            checked={settings.notificationsEnabled}
            onChange={handleEnableToggle}
            disabled={permission === "unsupported" || permission === "denied"}
            label="Enable reminders"
          />
        </div>

        {/* Time picker */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xl text-foreground">Reminder time</p>
            <p className="text-sm text-muted-foreground">
              Currently {formatTime12h(settings.reminderTime)}
            </p>
          </div>
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(e) => onUpdate({ reminderTime: e.target.value })}
            aria-label="Reminder time"
            className="rounded-md border-2 border-border bg-card px-3 py-1.5 text-lg text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Test button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleTest}
            className="rounded-md border-2 border-dashed border-border px-3 py-1.5 text-lg text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Send test reminder
          </button>
          {testMsg && <span className="text-base text-muted-foreground">{testMsg}</span>}
        </div>
      </section>

      {/* Per-habit notifications */}
      {habits.length > 0 && (
        <section className="rounded-lg border border-border/60 bg-secondary/20 p-4">
          <h2 className="font-hand text-3xl text-primary">Per-habit reminders</h2>
          <p className="mt-1 text-base text-muted-foreground">
            Choose which habits are included in your daily reminder.
          </p>
          <ul className="mt-3 divide-y divide-dashed divide-border/60">
            {habits.map((habit) => (
              <li key={habit.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="truncate text-xl text-foreground">{habit.name}</span>
                <ToggleSwitch
                  checked={isHabitNotifyOn(settings, habit.id)}
                  onChange={(next) => onSetHabitNotify(habit.id, next)}
                  disabled={!settings.notificationsEnabled}
                  label={`Reminders for ${habit.name}`}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Widget toggle */}
      <section className="rounded-lg border border-border/60 bg-secondary/20 p-4">
        <h2 className="font-hand text-3xl text-primary">Floating widget</h2>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-xl text-foreground">Show mini widget</p>
            <p className="text-sm text-muted-foreground">
              A quick-glance tracker pinned to the corner.
            </p>
          </div>
          <ToggleSwitch
            checked={settings.showWidget}
            onChange={(next) => onUpdate({ showWidget: next })}
            label="Show mini widget"
          />
        </div>
      </section>
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "border-primary bg-primary/20" : "border-border bg-secondary",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full transition-transform",
          checked ? "translate-x-6 bg-primary" : "translate-x-1 bg-muted-foreground",
        )}
      />
    </button>
  )
}
