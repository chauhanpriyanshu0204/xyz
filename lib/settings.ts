export type HabitNotifyMap = Record<string, boolean>

export type Settings = {
  /** Whether daily reminders are enabled globally. */
  notificationsEnabled: boolean
  /** Reminder time in 24h "HH:MM" format. */
  reminderTime: string
  /** Whether the floating mini widget is shown. */
  showWidget: boolean
  /** Per-habit reminder opt-out. Missing key = enabled (true). */
  habitNotify: HabitNotifyMap
}

export const SETTINGS_KEY = "habit-diary:settings:v1"

export const DEFAULT_SETTINGS: Settings = {
  notificationsEnabled: false,
  reminderTime: "21:00",
  showWidget: true,
  habitNotify: {},
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      habitNotify: parsed.habitNotify ?? {},
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // storage unavailable — ignore
  }
}

/** A habit is reminder-enabled unless explicitly set to false. */
export function isHabitNotifyOn(settings: Settings, habitId: string): boolean {
  return settings.habitNotify[habitId] !== false
}

/** Convert "HH:MM" into a Date for today at that time. */
export function timeToTodayDate(time: string): Date {
  const [h, m] = time.split(":").map(Number)
  const d = new Date()
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}

/** Format "HH:MM" (24h) into a friendly 12h label, e.g. "9:00 PM". */
export function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m || 0).padStart(2, "0")} ${period}`
}
