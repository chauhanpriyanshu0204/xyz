"use client"

import { useCallback, useEffect, useState } from "react"
import {
  type Settings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from "@/lib/settings"

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) saveSettings(settings)
  }, [settings, loaded])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const setHabitNotify = useCallback((habitId: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      habitNotify: { ...prev.habitNotify, [habitId]: enabled },
    }))
  }, [])

  return { settings, loaded, update, setHabitNotify }
}
