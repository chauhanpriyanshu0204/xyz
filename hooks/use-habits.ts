"use client"

import { useCallback, useEffect, useState } from "react"
import {
  type CellStatus,
  type Habit,
  createId,
  dateKey,
  getStatus,
  loadHabits,
  nextStatus,
  saveHabits,
} from "@/lib/habits"

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load once on mount.
  useEffect(() => {
    setHabits(loadHabits())
    setLoaded(true)
  }, [])

  // Persist whenever habits change (after initial load).
  useEffect(() => {
    if (loaded) saveHabits(habits)
  }, [habits, loaded])

  const addHabit = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setHabits((prev) => [
      ...prev,
      {
        id: createId(),
        name: trimmed,
        createdAt: dateKey(new Date()),
        records: {},
      },
    ])
  }, [])

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }, [])

  const renameHabit = useCallback((id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, name: trimmed } : h)),
    )
  }, [])

  /** Toggle a cell to a specific status, or cycle if not provided. */
  const toggleCell = useCallback((id: string, key: string, force?: CellStatus) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h
        const current = getStatus(h, key)
        const next = force ?? nextStatus(current)
        const records = { ...h.records }
        if (next === "empty") {
          delete records[key]
        } else {
          records[key] = next
        }
        return { ...h, records }
      }),
    )
  }, [])

  return {
    habits,
    loaded,
    addHabit,
    removeHabit,
    renameHabit,
    toggleCell,
  }
}
