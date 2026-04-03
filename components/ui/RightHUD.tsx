"use client"

import { useEffect, useRef, useState } from "react"
import {
  Camera,
  Eye,
  EyeOff,
  Hand,
  LoaderCircle,
  Moon,
  RotateCcw,
  Sparkles,
  Square,
  Sun,
  Video,
  Waves,
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

const SCHEMES: { id: ColorScheme; label: string; icon: LucideIcon }[] = [
  { id: "COSMIC", label: "COSMIC", icon: Sparkles },
  { id: "SOLAR", label: "SOLAR", icon: Sun },
  { id: "AURORA", label: "AURORA", icon: Waves },
  { id: "MONO", label: "MONO", icon: Moon },
]

function StatusRow({
  label,
  value,
  active = false,
}: {
  label: string
  value: string
  active?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/5 px-3 py-2">
      <span className="text-[8px] font-mono tracking-[0.22em] text-white/45">
        {label}
      </span>
      <span
        className={`text-[9px] font-mono tracking-[0.18em] ${
          active ? "text-[#00d8ff]" : "text-white/80"
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export function RightHUD() {
  const {
    colorScheme,
    setColorScheme,
    handTrackingActive,
    handTrackingLoading,
    toggleHandTracking,
    uiVisible,
    toggleUi,
    handGesture,
    telemetry,
    setParticleCount,
    setGlobeRadius,
    setRotationSpeed,
    setInteractionStrength,
  } = useSonarStore()

  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const trackingStatus = handTrackingLoading
    ? "LOADING"
    : handTrackingActive
      ? "LIVE"
      : "OFF"

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

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
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

  if (!uiVisible) {
    return (
      <div className="absolute right-3 top-24 z-40 sm:right-6 lg:right-8 lg:top-1/2 lg:-translate-y-1/2">
        <GlassPanel className="pointer-events-auto p-2 sm:p-3">
          <button
            onClick={toggleUi}
            className="flex items-center gap-2 rounded-xl border border-[#00d8ff]/20 bg-[#00d8ff]/10 px-3 py-2 text-[#00d8ff] transition-colors hover:bg-[#00d8ff]/15"
            aria-label="Show interface"
          >
            <Eye className="h-4 w-4" />
            <span className="text-[9px] font-mono tracking-[0.2em]">SHOW_UI</span>
          </button>
        </GlassPanel>
      </div>
    )
  }

  return (
    <div className="pointer-events-none flex w-full justify-end">
      <GlassPanel className="flex w-full max-w-80 flex-col gap-4 px-3 py-4 pointer-events-auto sm:w-[148px] sm:max-w-none sm:gap-5 sm:px-4 sm:py-5">
        <div className="text-center sm:text-center">
          <h2 className="text-[8px] font-mono tracking-[0.22em] text-[#00d8ff]">
            ORBITAL_CONTROLS
          </h2>
          <p className="mt-1 text-[7px] font-mono tracking-[0.16em] text-white/35">
            LIVE CONTROL SURFACE
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SCHEMES.map((scheme) => {
            const isActive = colorScheme === scheme.id

            return (
              <button
                key={scheme.id}
                onClick={() => setColorScheme(scheme.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition-all ${
                  isActive
                    ? "border-[#00d8ff]/45 bg-[#00d8ff]/12 text-[#00d8ff] shadow-[0_0_20px_rgba(0,216,255,0.12)]"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                }`}
                aria-pressed={isActive}
              >
                <scheme.icon className="h-4 w-4" />
                <span className="text-[7px] font-mono tracking-[0.18em]">
                  {scheme.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="space-y-2">
          <StatusRow
            label="TRACKING"
            value={trackingStatus}
            active={handTrackingActive || handTrackingLoading}
          />
          <StatusRow label="GESTURE" value={handGesture} active={handGesture !== "NONE"} />
          <StatusRow label="COORD" value={`${telemetry.x} / ${telemetry.y}`} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={toggleHandTracking}
            disabled={handTrackingLoading}
            className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition-all ${
              handTrackingActive || handTrackingLoading
                ? "border-[#00d8ff]/45 bg-[#00d8ff]/12 text-[#00d8ff]"
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
            } ${handTrackingLoading ? "cursor-wait opacity-85" : ""}`}
          >
            {handTrackingLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Hand className="h-4 w-4" />
            )}
            <span className="text-[7px] font-mono tracking-[0.18em]">
              {handTrackingLoading
                ? "STARTING"
                : handTrackingActive
                  ? "TRACK_ON"
                  : "TRACK_OFF"}
            </span>
          </button>

          <button
            onClick={handleReset}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-white/70 transition-all hover:border-white/20 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="text-[7px] font-mono tracking-[0.18em]">RESET</span>
          </button>

          <button
            onClick={handleCapture}
            className="flex flex-col items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-2 py-3 text-white transition-all hover:bg-cyan-500/20"
          >
            <Camera className="h-4 w-4" />
            <span className="text-[7px] font-mono tracking-[0.18em]">CAPTURE</span>
          </button>

          <button
            onClick={handleRecord}
            className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-white transition-all ${
              isRecording
                ? "border-red-400 bg-red-500/20 shadow-[0_0_20px_rgba(255,0,0,0.2)]"
                : "border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
            }`}
          >
            {isRecording ? (
              <Square className="h-4 w-4 fill-white" />
            ) : (
              <Video className="h-4 w-4" />
            )}
            <span className="text-[7px] font-mono tracking-[0.18em]">
              {isRecording ? "STOP_REC" : "RECORD"}
            </span>
          </button>
        </div>

        <button
          onClick={toggleUi}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white/70 transition-all hover:border-white/20 hover:text-white"
        >
          <EyeOff className="h-4 w-4" />
          <span className="text-[8px] font-mono tracking-[0.2em]">HIDE_UI</span>
        </button>
      </GlassPanel>
    </div>
  )
}
