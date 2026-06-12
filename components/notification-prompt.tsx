"use client"

import { useEffect, useState } from "react"
import { iosNeedsInstall } from "@/lib/settings"

type Permission = "default" | "granted" | "denied" | "unsupported"

type NotificationPromptProps = {
  /** Whether settings have loaded and we know the prompt hasn't been shown. */
  show: boolean
  permission: Permission
  onEnable: () => Promise<Permission>
  onEnabled: () => void
  onDismiss: () => void
}

export function NotificationPrompt({
  show,
  permission,
  onEnable,
  onEnabled,
  onDismiss,
}: NotificationPromptProps) {
  const [visible, setVisible] = useState(false)
  const [needsInstall, setNeedsInstall] = useState(false)

  useEffect(() => {
    // Only prompt when notifications are supported and not yet decided.
    if (!show) return
    if (permission === "unsupported" || permission === "granted" || permission === "denied") return
    setNeedsInstall(iosNeedsInstall())
    setVisible(true)
  }, [show, permission])

  if (!visible) return null

  const handleEnable = async () => {
    if (needsInstall) return
    const result = await onEnable()
    if (result === "granted") onEnabled()
    setVisible(false)
    onDismiss()
  }

  const handleClose = () => {
    setVisible(false)
    onDismiss()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-prompt-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={handleClose}
        className="absolute inset-0 bg-foreground/30"
      />

      {/* Notebook card */}
      <div className="notebook-paper relative w-full max-w-sm rounded-lg px-6 py-6 shadow-xl">
        <h2 id="notif-prompt-title" className="font-hand text-4xl text-primary">
          Daily reminders
        </h2>
        <p className="mt-2 text-lg leading-relaxed text-foreground">
          Want a gentle nudge each day to log your habits? We&apos;ll send you a friendly
          notification: <span className="text-primary">&ldquo;📝 Don&apos;t forget to log your habits today!&rdquo;</span>
        </p>

        {needsInstall ? (
          <div className="mt-4 rounded-md bg-accent/10 px-3 py-3 text-base text-foreground">
            <p className="text-accent">To get reminders on iPhone or iPad:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Tap the Share button in Safari.</li>
              <li>Choose &ldquo;Add to Home Screen&rdquo;.</li>
              <li>Open the app from your Home Screen, then enable reminders.</li>
            </ol>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border-2 border-border px-4 py-1.5 text-lg text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Got it
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md px-4 py-1.5 text-lg text-muted-foreground transition-colors hover:text-foreground"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={handleEnable}
              className="rounded-md border-2 border-primary bg-primary/10 px-4 py-1.5 text-lg text-primary transition-colors hover:bg-primary/20"
            >
              Enable reminders
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
