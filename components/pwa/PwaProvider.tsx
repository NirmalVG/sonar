"use client"

import { useEffect, useMemo, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PwaProvider() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() => {
    if (typeof window === "undefined") return false

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    )
  })

  const isSupported = useMemo(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.isSecureContext,
    [],
  )

  const showIosHint = useMemo(() => {
    if (typeof window === "undefined" || installed) return false

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isiOS = /iphone|ipad|ipod/.test(userAgent)
    const isSafari =
      /safari/.test(userAgent) &&
      !/crios|fxios|edgios|chrome|android/.test(userAgent)

    return isiOS && isSafari
  }, [installed])

  useEffect(() => {
    if (!isSupported) return

    let active = true

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .catch((error) => {
        console.error("PWA service worker registration failed:", error)
      })

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      if (active) {
        setInstallEvent(event as BeforeInstallPromptEvent)
      }
    }

    const handleAppInstalled = () => {
      if (!active) return
      setInstalled(true)
      setInstallEvent(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      active = false
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [isSupported])

  const handleInstall = async () => {
    if (!installEvent) return

    await installEvent.prompt()
    const choice = await installEvent.userChoice

    if (choice.outcome === "accepted") {
      setInstalled(true)
    }

    setInstallEvent(null)
  }

  if (!isSupported || installed || (!installEvent && !showIosHint)) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex justify-center sm:bottom-6">
      <div className="pointer-events-auto max-w-md rounded-2xl border border-cyan-400/25 bg-[#07111d]/92 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.95)]" />
          <div className="min-w-0">
            <p className="text-[11px] font-mono tracking-[0.24em] text-cyan-300">
              PWA READY
            </p>
            {installEvent ? (
              <p className="mt-1 text-sm text-white/82">
                Install Sonar for a full-screen app experience with faster repeat
                launches.
              </p>
            ) : (
              <p className="mt-1 text-sm text-white/82">
                On iPhone or iPad, tap Share and choose Add to Home Screen to
                install Sonar.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              {installEvent ? (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="rounded-xl border border-cyan-300/35 bg-cyan-400/12 px-3 py-2 text-xs font-mono tracking-[0.18em] text-white transition-colors hover:bg-cyan-400/18"
                >
                  INSTALL
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setInstallEvent(null)
                }}
                className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-mono tracking-[0.18em] text-white/75 transition-colors hover:border-white/20 hover:text-white"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
