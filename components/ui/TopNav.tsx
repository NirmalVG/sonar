"use client"

import { Hand } from "lucide-react"
import { GlassPanel } from "./GlassPanel"
import { useSonarStore } from "@/store/useSonarStore"

export function TopNav() {
  const { handTrackingActive, toggleHandTracking } = useSonarStore()

  return (
    <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-50 pointer-events-none">
      {/* BRANDING */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-[#00d8ff] shadow-[0_0_10px_#00d8ff] animate-pulse" />
        <h1 className="text-3xl font-bold tracking-[0.2em] text-[#00d8ff]">
          SONAR
        </h1>
      </div>

      {/* HAND TRACKING TOGGLE */}
      {/* Note: pointer-events-auto ensures this specific panel can be clicked! */}
      <GlassPanel className="flex items-center gap-4 px-5 py-2.5 rounded-full pointer-events-auto">
        <Hand
          className={`w-4 h-4 transition-colors duration-300 ${
            handTrackingActive ? "text-[#00d8ff]" : "text-white/70"
          }`}
        />
        <span
          className={`text-xs font-mono tracking-widest transition-colors duration-300 ${
            handTrackingActive ? "text-[#00d8ff]" : "text-white/70"
          }`}
        >
          HAND TRACKING
        </span>

        {/* Custom Animated Toggle Switch */}
        <button
          onClick={toggleHandTracking}
          className={`relative w-10 h-5 rounded-full border transition-colors duration-300 focus:outline-none ${
            handTrackingActive
              ? "bg-[#00d8ff]/20 border-[#00d8ff]/50"
              : "bg-white/10 border-white/20"
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
              handTrackingActive
                ? "translate-x-5 bg-[#00d8ff] shadow-[0_0_8px_#00d8ff]"
                : "translate-x-0 bg-white/50"
            }`}
          />
        </button>
      </GlassPanel>
    </div>
  )
}
