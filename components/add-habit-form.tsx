"use client"

import { useState } from "react"

type AddHabitFormProps = {
  onAdd: (name: string) => void
}

export function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [value, setValue] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    onAdd(value)
    setValue("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a new habit…"
        aria-label="New habit name"
        className="min-w-0 flex-1 border-b-2 border-dashed border-border bg-transparent px-1 py-1.5 text-xl text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md border-2 border-primary bg-primary/10 px-4 py-1.5 text-lg text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        + Add
      </button>
    </form>
  )
}
