export type CellStatus = "done" | "missed" | "empty"

export type Habit = {
  id: string
  name: string
  createdAt: string // ISO date
  // map of dateKey -> status (only "done" / "missed" are stored)
  records: Record<string, "done" | "missed">
}

export const STORAGE_KEY = "habit-diary:v1"

/** Format a Date as a stable YYYY-MM-DD key in local time. */
export function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Parse a YYYY-MM-DD key back into a local Date. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b)
}

export function isFuture(date: Date): boolean {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date.getTime() > today.getTime()
}

/** Cycle a cell status: empty -> done -> missed -> empty */
export function nextStatus(current: CellStatus): CellStatus {
  if (current === "empty") return "done"
  if (current === "done") return "missed"
  return "empty"
}

export function getStatus(habit: Habit, key: string): CellStatus {
  return habit.records[key] ?? "empty"
}

/**
 * Current streak = number of consecutive days marked "done" ending today
 * (or yesterday, so a streak isn't broken just because today isn't logged yet).
 */
export function currentStreak(habit: Habit): number {
  const today = new Date()
  let cursor = new Date(today)

  // If today isn't marked done, allow the streak to be anchored at yesterday.
  if (getStatus(habit, dateKey(today)) !== "done") {
    cursor = addDays(today, -1)
  }

  let streak = 0
  // Walk backwards while days are "done".
  while (getStatus(habit, dateKey(cursor)) === "done") {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** Generate the last `count` days (oldest -> newest), ending at `end`. */
export function lastNDays(end: Date, count: number): Date[] {
  const days: Date[] = []
  for (let i = count - 1; i >= 0; i--) {
    days.push(addDays(end, -i))
  }
  return days
}

/**
 * Best streak ever = longest run of consecutive "done" days across all history.
 */
export function bestStreak(habit: Habit): number {
  const doneKeys = Object.entries(habit.records)
    .filter(([, status]) => status === "done")
    .map(([key]) => key)
    .sort()

  if (doneKeys.length === 0) return 0

  let best = 1
  let run = 1
  for (let i = 1; i < doneKeys.length; i++) {
    const prev = parseDateKey(doneKeys[i - 1])
    const curr = parseDateKey(doneKeys[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000)
    if (diffDays === 1) {
      run += 1
    } else {
      run = 1
    }
    if (run > best) best = run
  }
  return best
}

/** Return the Monday-to-Sunday week containing `date` (oldest -> newest). */
export function weekDays(date: Date): Date[] {
  const day = date.getDay() // 0 = Sun ... 6 = Sat
  const offsetToMonday = day === 0 ? -6 : 1 - day
  const monday = addDays(date, offsetToMonday)
  const days: Date[] = []
  for (let i = 0; i < 7; i++) days.push(addDays(monday, i))
  return days
}

/** Return every day in the month containing `date` (oldest -> newest). */
export function monthDays(date: Date): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const total = new Date(year, month + 1, 0).getDate()
  const days: Date[] = []
  for (let d = 1; d <= total; d++) days.push(new Date(year, month, d))
  return days
}

/**
 * Count how many of the given days a habit was marked "done".
 * Future days are ignored so percentages stay fair mid-week / mid-month.
 */
export function countDone(habit: Habit, days: Date[]): number {
  return days.reduce((sum, d) => {
    if (isFuture(d)) return sum
    return getStatus(habit, dateKey(d)) === "done" ? sum + 1 : sum
  }, 0)
}

/** Percentage (0-100) of done days out of the elapsed days in the range. */
export function completionPercent(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((done / total) * 100)
}

export type Motivation = { label: string; emoji: string; tone: "high" | "mid" | "low" }

/** Motivational status based on completion percentage. */
export function motivation(percent: number): Motivation {
  if (percent > 70) return { label: "Crushing it!", emoji: "🔥", tone: "high" }
  if (percent >= 40) return { label: "Keep going!", emoji: "💪", tone: "mid" }
  return { label: "Need more effort", emoji: "😴", tone: "low" }
}

export function monthName(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function loadHabits(): Habit[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Habit[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  } catch {
    // storage full or unavailable — ignore
  }
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function weekdayLabel(date: Date): string {
  return WEEKDAYS[date.getDay()]
}

export function dayNumber(date: Date): string {
  return String(date.getDate())
}

export function longDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}
