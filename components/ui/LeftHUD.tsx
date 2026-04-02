"use client"

import { BarChart2 } from "lucide-react"
import { GlassPanel } from "./GlassPanel"
import { useSonarStore } from "@/store/useSonarStore"

export function LeftHUD() {
  const telemetry = useSonarStore((state) => state.telemetry)

  return (
    <div className="absolute left-3 top-20 z-40 flex w-[calc(100%-1.5rem)] max-w-80 flex-col gap-4 pointer-events-none sm:left-8 sm:top-1/2 sm:w-80 sm:-translate-y-1/2 sm:gap-6">
      {/* SYSTEM DIAGNOSTICS PANEL */}
      <GlassPanel className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between text-white/50 sm:mb-6">
          <h2 className="text-[10px] tracking-[0.2em] font-mono sm:text-xs">
            SYSTEM_DIAGNOSTICS
          </h2>
          <BarChart2 className="w-4 h-4" />
        </div>

        <div className="space-y-5">
          {/* Latency row */}
          <div>
            <div className="flex justify-between text-[10px] font-mono tracking-widest text-white/70 mb-2">
              <span>LATENCY</span>
              <span>4.2 MS</span>
            </div>
            <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[15%] bg-[#00d8ff] shadow-[0_0_8px_#00d8ff]" />
            </div>
          </div>

          {/* Buffer row */}
          <div>
            <div className="flex justify-between text-[10px] font-mono tracking-widest text-white/70 mb-2">
              <span>BUFFER</span>
              <span>98%</span>
            </div>
            <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[98%] bg-[#00d8ff] shadow-[0_0_8px_#00d8ff]" />
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* ACTIVE TELEMETRY PANEL */}
      <GlassPanel className="p-4 sm:p-6">
        <h2 className="text-[10px] tracking-[0.2em] font-mono text-white/50 mb-4 sm:mb-6 sm:text-xs">
          ACTIVE_TELEMETRY
        </h2>

        <div className="flex gap-6 sm:gap-8">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-white/50 mb-1">
              COORD_X
            </div>
            <div className="text-lg font-mono text-white sm:text-xl">{telemetry.x}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-white/50 mb-1">
              COORD_Y
            </div>
            <div className="text-lg font-mono text-white sm:text-xl">{telemetry.y}</div>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
