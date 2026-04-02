"use client"

import {
  Sparkles,
  Sun,
  Waves,
  Moon,
  Video,
  EyeOff,
  type LucideIcon,
} from "lucide-react"
import { GlassPanel } from "./GlassPanel"
import { useSonarStore, ColorScheme } from "@/store/useSonarStore"

const SCHEMES: { id: ColorScheme; label: string; icon: LucideIcon }[] = [
  { id: "COSMIC", label: "COSMIC", icon: Sparkles },
  { id: "SOLAR", label: "SOLAR", icon: Sun },
  { id: "AURORA", label: "AURORA", icon: Waves },
  { id: "MONO", label: "MONO", icon: Moon },
]

export function RightHUD() {
  const { colorScheme, setColorScheme, toggleUi, handTrackingActive, toggleHandTracking } =
    useSonarStore()

  return (
    <div className="absolute right-3 top-20 z-40 pointer-events-none sm:right-8 sm:top-1/2 sm:-translate-y-1/2">
      <GlassPanel className="flex w-20 flex-col items-center gap-6 px-3 py-5 sm:w-24 sm:gap-10 sm:px-4 sm:py-8">
        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-[8px] tracking-[0.2em] font-mono text-[#00d8ff] mb-1">
            ORBITAL_CONTROLS
          </h2>
          <p className="hidden text-[6px] tracking-widest font-mono text-white/40 sm:block">
            V.01-ALPHA
          </p>
        </div>

        {/* COLOR SCHEME TOGGLES */}
        <div className="flex flex-col gap-4 w-full sm:gap-6">
          {SCHEMES.map((scheme) => {
            const isActive = colorScheme === scheme.id
            return (
              <button
                key={scheme.id}
                onClick={() => setColorScheme(scheme.id)}
                className={`flex flex-col items-center gap-2 w-full transition-all duration-300 ${
                  isActive
                    ? "scale-110"
                    : "hover:scale-105 opacity-50 hover:opacity-100"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 sm:h-12 sm:w-12 ${
                    isActive
                      ? "bg-[#00d8ff] text-black shadow-[0_0_20px_rgba(0,216,255,0.4)]"
                      : "bg-white/5 text-white/70 border border-white/10"
                  }`}
                >
                  <scheme.icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[8px] font-mono tracking-widest transition-colors ${
                    isActive ? "text-[#00d8ff]" : "text-white/50"
                  } hidden sm:inline`}
                >
                  {scheme.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="w-8 h-[1px] bg-white/10 my-2" />

        {/* QUICK ACTIONS */}
        <div className="flex flex-col gap-6 w-full">
          <button
            onClick={toggleHandTracking}
            className={`flex justify-center transition-colors ${
              handTrackingActive
                ? "text-[#00d8ff]"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={toggleUi}
            className="flex justify-center text-white/50 hover:text-[#00d8ff] transition-colors"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </GlassPanel>
    </div>
  )
}
