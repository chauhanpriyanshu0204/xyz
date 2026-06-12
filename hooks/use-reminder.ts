"use client"

import { useEffect, useRef, useState } from "react"
import { type Settings, timeToTodayDate } from "@/lib/settings"

const LAST_NOTIFIED_KEY = "habit-diary:lastNotified:v1"

type Permission = "default" | "granted" | "denied" | "unsupported"

function getPermission(): Permission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported"
  return Notification.permission as Permission
}

/**
 * Schedules a single daily reminder notification at the configured time,
 * for as long as the tab is open. Re-arms itself each day. Uses a localStorage
 * marker so it won't double-fire on refresh within the same day.
 */
export function useReminder(settings: Settings, loaded: boolean) {
  const [permission, setPermission] = useState<Permission>("default")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync permission state on mount.
  useEffect(() => {
    setPermission(getPermission())
  }, [])

  const requestPermission = async (): Promise<Permission> => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported"
    const result = (await Notification.requestPermission()) as Permission
    setPermission(result)
    return result
  }

  useEffect(() => {
    if (!loaded) return
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!settings.notificationsEnabled) return
    if (getPermission() !== "granted") return

    const arm = () => {
      const now = new Date()
      let target = timeToTodayDate(settings.reminderTime)
      // If today's time already passed, aim for tomorrow.
      if (target.getTime() <= now.getTime()) {
        target = new Date(target.getTime() + 24 * 60 * 60 * 1000)
      }
      const delay = target.getTime() - now.getTime()

      timerRef.current = setTimeout(() => {
        fireReminder()
        arm() // re-arm for the following day
      }, delay)
    }

    arm()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [settings.notificationsEnabled, settings.reminderTime, loaded])

  return { permission, requestPermission, setPermission }
}

function fireReminder() {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission !== "granted") return

  const todayKey = new Date().toDateString()
  try {
    if (window.localStorage.getItem(LAST_NOTIFIED_KEY) === todayKey) return
    window.localStorage.setItem(LAST_NOTIFIED_KEY, todayKey)
  } catch {
    // ignore storage issues and still notify
  }

  new Notification("My Habit Diary", {
    body: "Hey! Don't forget to log your habits today 📝",
    icon: "/icon.png",
    tag: "habit-daily-reminder",
  })
}

/** Send an immediate test/preview notification. */
export function sendTestReminder(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false
  if (Notification.permission !== "granted") return false
  new Notification("My Habit Diary", {
    body: "Hey! Don't forget to log your habits today 📝",
    icon: "/icon.png",
    tag: "habit-daily-reminder-test",
  })
  return true
}
