"use client"

import { Hand, LoaderCircle } from "lucide-react"
import { GlassPanel } from "./GlassPanel"
import { useSonarStore } from "@/store/useSonarStore"

export function TopNav() {
  const { handTrackingActive, handTrackingLoading, toggleHandTracking } =
    useSonarStore()

  const statusActive = handTrackingActive || handTrackingLoading

  return (
    <div className="flex w-full flex-col gap-4 pointer-events-none sm:flex-row sm:items-start sm:justify-between">
      {/* BRANDING */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-[#00d8ff] shadow-[0_0_10px_#00d8ff] animate-pulse" />
        <h1 className="text-2xl font-bold tracking-[0.18em] text-[#00d8ff] sm:text-3xl sm:tracking-[0.2em]">
          SONAR
        </h1>
      </div>

      {/* HAND TRACKING TOGGLE */}
      {/* Note: pointer-events-auto ensures this specific panel can be clicked! */}
      <GlassPanel className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 pointer-events-auto sm:w-auto sm:justify-start sm:gap-4 sm:rounded-full sm:px-5 sm:py-2.5">
        {handTrackingLoading ? (
          <LoaderCircle className="w-4 h-4 animate-spin text-[#00d8ff]" />
        ) : (
          <Hand
            className={`w-4 h-4 transition-colors duration-300 ${
              handTrackingActive ? "text-[#00d8ff]" : "text-white/70"
            }`}
          />
        )}
        <span
          className={`text-[10px] font-mono tracking-[0.18em] transition-colors duration-300 sm:text-xs sm:tracking-widest ${
            statusActive ? "text-[#00d8ff]" : "text-white/70"
          }`}
        >
          {handTrackingLoading ? "HAND TRACKING..." : "HAND TRACKING"}
        </span>

        {/* Custom Animated Toggle Switch */}
        <button
          onClick={toggleHandTracking}
          disabled={handTrackingLoading}
          className={`relative w-10 h-5 rounded-full border transition-colors duration-300 focus:outline-none ${
            statusActive
              ? "bg-[#00d8ff]/20 border-[#00d8ff]/50"
              : "bg-white/10 border-white/20"
          } ${handTrackingLoading ? "cursor-wait opacity-80" : ""}`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
              statusActive
                ? "translate-x-5 bg-[#00d8ff] shadow-[0_0_8px_#00d8ff]"
                : "translate-x-0 bg-white/50"
            }`}
          />
        </button>
      </GlassPanel>
    </div>
  )
}
