"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings2,
  Grid,
  Orbit,
  RefreshCw,
  Zap,
  Camera,
  Video,
  Square,
  Sparkles,
  Sun,
  Waves,
  Moon,
  Hand,
  Eye,
  RotateCcw,
  type LucideIcon,
} from "lucide-react"
import { GlassPanel } from "./GlassPanel"
import { useSonarStore, type ColorScheme } from "@/store/useSonarStore"

const DEFAULTS = {
  particleCount: 140000,
  globeRadius: 7.2,
  rotationSpeed: 1.4,
  interactionStrength: 0.85,
  colorScheme: "COSMIC" as ColorScheme,
}

const COLOR_SCHEMES: { id: ColorScheme; label: string; icon: LucideIcon }[] = [
  { id: "COSMIC", label: "COSMIC", icon: Sparkles },
  { id: "SOLAR", label: "SOLAR", icon: Sun },
  { id: "AURORA", label: "AURORA", icon: Waves },
  { id: "MONO", label: "MONO", icon: Moon },
]

type PanelId = "particles" | "field" | "motion" | "actions"

function CustomSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (val: number) => void
  formatValue: (val: number) => string | number
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs font-mono tracking-[0.2em] text-white/70">
        <span className="break-all sm:break-normal">{label}</span>
        <span className="text-white">{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[2px] bg-white/10 rounded-full appearance-none outline-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:bg-[#00d8ff] [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00d8ff]"
      />
    </div>
  )
}

function StatusPill({
  label,
  value,
  active = false,
}: {
  label: string
  value: string
  active?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 sm:px-4">
      <div className="text-[9px] font-mono tracking-[0.22em] text-white/40">
        {label}
      </div>
      <div
        className={`mt-2 text-xs font-mono tracking-[0.14em] sm:text-sm sm:tracking-[0.18em] ${
          active ? "text-[#00d8ff]" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  )
}

export function BottomControls() {
  const {
    particleCount,
    setParticleCount,
    globeRadius,
    setGlobeRadius,
    rotationSpeed,
    setRotationSpeed,
    interactionStrength,
    setInteractionStrength,
    colorScheme,
    setColorScheme,
    telemetry,
    handGesture,
    handTrackingActive,
    handTrackingLoading,
    toggleHandTracking,
    uiVisible,
    toggleUi,
  } = useSonarStore()

  const [isOpen, setIsOpen] = useState(true)
  const [activePanel, setActivePanel] = useState<PanelId>("particles")
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const dockItems = useMemo(
    () => [
      { id: "particles" as const, icon: Grid, label: "PARTICLES" },
      { id: "field" as const, icon: Orbit, label: "FIELD" },
      { id: "motion" as const, icon: RefreshCw, label: "MOTION" },
      { id: "actions" as const, icon: Zap, label: "ACTIONS" },
    ],
    [],
  )

  const openPanel = (panel: PanelId) => {
    setActivePanel(panel)
    setIsOpen(true)
  }

  const handleCapture = () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return

    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `SONAR_CAPTURE_${Date.now()}.png`
    link.href = image
    link.click()
  }

  const handleRecord = () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return

    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      const stream = canvas.captureStream(60)
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" })

      mediaRecorderRef.current = recorder
      recordedChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.download = `SONAR_RECORDING_${Date.now()}.webm`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      }

      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Failed to start recording:", error)
      alert("Your browser does not support WebM canvas recording.")
    }
  }

  const handleReset = () => {
    setParticleCount(DEFAULTS.particleCount)
    setGlobeRadius(DEFAULTS.globeRadius)
    setRotationSpeed(DEFAULTS.rotationSpeed)
    setInteractionStrength(DEFAULTS.interactionStrength)
    setColorScheme(DEFAULTS.colorScheme)
  }

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop()
    }
  }, [])

  const panelContent = {
    particles: (
      <div className="flex-1 flex flex-col gap-6 sm:gap-8">
        <CustomSlider
          label="PARTICLE_COUNT"
          value={particleCount}
          min={10000}
          max={180000}
          step={10000}
          onChange={setParticleCount}
          formatValue={(val) => val.toLocaleString()}
        />
        <CustomSlider
          label="INTERACTION_STRENGTH"
          value={interactionStrength}
          min={0}
          max={2}
          step={0.05}
          onChange={setInteractionStrength}
          formatValue={(val) => val.toFixed(2)}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatusPill label="DENSITY" value={particleCount > 150000 ? "MAX" : particleCount > 80000 ? "HIGH" : "LIGHT"} active />
          <StatusPill label="GESTURE" value={handGesture} active={handGesture !== "NONE"} />
          <StatusPill
            label="TRACKING"
            value={
              handTrackingLoading
                ? "LOADING"
                : handTrackingActive
                  ? "LIVE"
                  : "OFF"
            }
            active={handTrackingActive || handTrackingLoading}
          />
        </div>
      </div>
    ),
    field: (
      <div className="flex-1 flex flex-col gap-6 sm:gap-8">
        <CustomSlider
          label="FIELD_SCALE"
          value={globeRadius}
          min={1}
          max={15}
          step={0.1}
          onChange={setGlobeRadius}
          formatValue={(val) => val.toFixed(1)}
        />
        <div>
          <div className="mb-4 text-[10px] font-mono tracking-[0.2em] text-white/50">
            COLOR_SCHEME
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {COLOR_SCHEMES.map((scheme) => {
              const isActive = colorScheme === scheme.id
              return (
                <button
                  key={scheme.id}
                  onClick={() => setColorScheme(scheme.id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                      isActive
                        ? "border-[#00d8ff]/50 bg-[#00d8ff]/10 text-[#00d8ff]"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <scheme.icon className="h-4 w-4" />
                  <span className="text-[10px] font-mono tracking-[0.18em]">
                    {scheme.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    ),
    motion: (
      <div className="flex-1 flex flex-col gap-6 sm:gap-8">
        <CustomSlider
          label="ROTATION_SPEED"
          value={rotationSpeed}
          min={0}
          max={5}
          step={0.1}
          onChange={setRotationSpeed}
          formatValue={(val) => val.toFixed(1)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={toggleHandTracking}
            disabled={handTrackingLoading}
            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
              handTrackingActive || handTrackingLoading
                ? "border-[#00d8ff]/50 bg-[#00d8ff]/10 text-[#00d8ff]"
                : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
            } ${handTrackingLoading ? "cursor-wait opacity-85" : ""}`}
          >
            <div className="flex items-center gap-3">
              <Hand className="h-4 w-4" />
              <span className="text-[10px] font-mono tracking-[0.2em]">
                HAND_TRACKING
              </span>
            </div>
            <div className="mt-3 text-xs font-mono">
              {handTrackingLoading
                ? "STARTING..."
                : handTrackingActive
                  ? "ENABLED"
                  : "DISABLED"}
            </div>
          </button>
          <button
            onClick={toggleUi}
            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
              uiVisible
                ? "border-white/10 bg-white/5 text-white/80 hover:border-white/20"
                : "border-[#00d8ff]/50 bg-[#00d8ff]/10 text-[#00d8ff]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Eye className="h-4 w-4" />
              <span className="text-[10px] font-mono tracking-[0.2em]">
                UI_OVERLAY
              </span>
            </div>
            <div className="mt-3 text-xs font-mono">
              {uiVisible ? "VISIBLE" : "HIDDEN"}
            </div>
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatusPill label="COORD_X" value={telemetry.x} />
          <StatusPill label="COORD_Y" value={telemetry.y} />
        </div>
      </div>
    ),
    actions: (
      <div className="flex-1 flex flex-col gap-6 sm:gap-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={handleCapture}
            className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 py-4 text-xs font-mono tracking-[0.18em] text-white transition-colors hover:bg-cyan-500/20"
          >
            <Camera className="h-4 w-4" />
            CAPTURE_FRAME
          </button>
          <button
            onClick={handleRecord}
            className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-xs font-mono tracking-[0.18em] transition-all ${
              isRecording
                ? "border-red-400 bg-red-500/20 text-white shadow-[0_0_20px_rgba(255,0,0,0.35)]"
                : "border-red-500/30 bg-red-500/10 text-white hover:bg-red-500/20"
            }`}
          >
            {isRecording ? (
              <Square className="h-4 w-4 fill-white" />
            ) : (
              <Video className="h-4 w-4" />
            )}
            {isRecording ? "STOP_RECORDING" : "RECORD_LOOP"}
          </button>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-mono tracking-[0.18em] text-white/80 transition-colors hover:border-white/20 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          RESET_TO_DEFAULTS
        </button>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatusPill label="SCHEME" value={colorScheme} active />
          <StatusPill label="RECORDER" value={isRecording ? "LIVE" : "IDLE"} active={isRecording} />
          <StatusPill label="PANEL" value={activePanel.toUpperCase()} />
        </div>
      </div>
    ),
  } satisfies Record<PanelId, React.ReactNode>

  return (
    <div className="absolute bottom-4 left-1/2 z-40 flex w-[calc(100%-1rem)] max-w-[980px] -translate-x-1/2 flex-col items-center gap-4 px-2 sm:bottom-8 sm:w-[calc(100%-2rem)] sm:gap-6 sm:px-0 pointer-events-none">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="w-full pointer-events-auto"
          >
            <GlassPanel className="border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-4 sm:p-6 lg:p-8">
              <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-[0.24em] text-[#00d8ff]">
                    CONTROL_SURFACE
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-[0.16em] text-white sm:text-2xl">
                    {activePanel.toUpperCase()}
                  </div>
                </div>
                <div className="text-left text-[10px] font-mono tracking-[0.2em] text-white/40 sm:text-right">
                  REAL_TIME TUNING
                </div>
              </div>
              {panelContent[activePanel]}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassPanel className="flex w-full flex-wrap items-center justify-center gap-2 rounded-[28px] p-2 pointer-events-auto sm:w-auto sm:rounded-full">
        {dockItems.map((item) => {
          const isActive = activePanel === item.id

          return (
            <button
              key={item.id}
              onClick={() => openPanel(item.id)}
              className={`flex min-w-[72px] flex-1 flex-col items-center gap-1 rounded-2xl p-3 transition-all sm:w-[72px] sm:flex-none sm:rounded-full ${
                isActive && isOpen
                  ? "bg-[#00d8ff]/10 text-[#00d8ff] shadow-[inset_0_0_20px_rgba(0,216,255,0.2)]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[8px] font-mono tracking-widest">
                {item.label}
              </span>
            </button>
          )
        })}

        <button
          onClick={() => setIsOpen((current) => !current)}
          className={`flex min-w-[72px] flex-1 flex-col items-center gap-1 rounded-2xl p-3 transition-all sm:w-[72px] sm:flex-none sm:rounded-full ${
            isOpen
              ? "bg-[#00d8ff]/10 text-[#00d8ff] shadow-[inset_0_0_20px_rgba(0,216,255,0.2)]"
              : "text-white/55 hover:text-white"
          }`}
        >
          <Settings2 className="h-4 w-4" />
          <span className="text-[8px] font-mono tracking-widest">SETTINGS</span>
        </button>
      </GlassPanel>
    </div>
  )
}
