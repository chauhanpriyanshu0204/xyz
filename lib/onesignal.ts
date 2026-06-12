"use client"

/**
 * Thin wrapper around the OneSignal Web SDK (v16), which is loaded via the
 * <Script> tags in app/layout.tsx and exposed on window.OneSignalDeferred.
 *
 * Strategy: "Dashboard automation + tags".
 * - The app asks for push permission and then writes the user's reminder
 *   preferences as OneSignal **tags** (reminder_enabled + reminder_time).
 * - In the OneSignal dashboard you create ONE Recurring/Automated message
 *   ("📝 Log your habits today!") that targets users by those tags.
 * - No server code or REST API key is required here.
 */

type OneSignalApi = {
  Notifications: {
    permission: boolean
    permissionNative: NotificationPermission | "default"
    requestPermission: () => Promise<void>
    addEventListener: (event: string, cb: (...args: unknown[]) => void) => void
  }
  User: {
    addTags: (tags: Record<string, string>) => Promise<void> | void
    removeTags: (keys: string[]) => Promise<void> | void
  }
}

type DeferredCallback = (os: OneSignalApi) => void | Promise<void>

declare global {
  interface Window {
    OneSignalDeferred?: { push: (cb: DeferredCallback) => void } & DeferredCallback[]
  }
}

/** Queue a callback that runs once the OneSignal SDK is ready. */
function withOneSignal(cb: DeferredCallback): void {
  if (typeof window === "undefined") return
  window.OneSignalDeferred = window.OneSignalDeferred || ([] as never)
  window.OneSignalDeferred.push(cb)
}

/** True when the OneSignal SDK script is present on the page. */
export function isOneSignalAvailable(): boolean {
  return typeof window !== "undefined" && Array.isArray(window.OneSignalDeferred)
}

/**
 * Prompt the user for push permission via OneSignal's native prompt.
 * Resolves with the resulting browser permission string.
 */
export function requestOneSignalPermission(): Promise<NotificationPermission> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      resolve("denied")
      return
    }
    withOneSignal(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission()
      } catch {
        // ignore — fall through to reading the resulting permission
      }
      resolve(Notification.permission)
    })
    // Safety net: if the SDK never loads, resolve with current permission.
    setTimeout(() => resolve(Notification.permission), 6000)
  })
}

/**
 * Sync the user's reminder preferences to OneSignal as tags so a dashboard
 * Recurring message can target them. Call whenever settings change.
 */
export function syncReminderTags(opts: { enabled: boolean; time: string }): void {
  withOneSignal((OneSignal) => {
    if (opts.enabled) {
      OneSignal.User.addTags({
        reminder_enabled: "true",
        // "HH:MM" — used to segment users by send time in the dashboard.
        reminder_time: opts.time,
      })
    } else {
      OneSignal.User.addTags({ reminder_enabled: "false" })
    }
  })
}
