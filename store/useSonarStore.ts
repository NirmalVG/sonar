import { create } from "zustand"
import * as THREE from "three"

export type ColorScheme = "COSMIC" | "SOLAR" | "AURORA" | "MONO"
// NEW: Gesture types for the organic dust physics
export type Gesture = "OPEN" | "FIST" | "NONE"

interface SonarState {
  // Global UI & Tracking State
  handTrackingActive: boolean
  toggleHandTracking: () => void
  uiVisible: boolean
  toggleUi: () => void

  // Configuration
  particleCount: number
  setParticleCount: (count: number) => void

  globeRadius: number
  setGlobeRadius: (radius: number) => void

  rotationSpeed: number
  setRotationSpeed: (speed: number) => void

  interactionStrength: number
  setInteractionStrength: (strength: number) => void

  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void

  // Real-time Telemetry
  telemetry: { x: string; y: string }
  setTelemetry: (x: string, y: string) => void

  // MediaPipe 3D Hand Coordinates & Gestures
  handPosition: THREE.Vector3
  setHandPosition: (pos: THREE.Vector3) => void

  handGesture: Gesture
  setHandGesture: (gesture: Gesture) => void
}

export const useSonarStore = create<SonarState>((set) => ({
  // Global UI & Tracking State
  handTrackingActive: false,
  toggleHandTracking: () =>
    set((state) => ({ handTrackingActive: !state.handTrackingActive })),

  uiVisible: true,
  toggleUi: () => set((state) => ({ uiVisible: !state.uiVisible })),

  // Configuration Defaults
  particleCount: 140000,
  setParticleCount: (particleCount) => set({ particleCount }),

  // Note: We keep Radius and Shape in the store so the BottomControls UI sliders
  // don't break, even though our new ambient dust shader doesn't strictly use them right now!
  globeRadius: 7.2,
  setGlobeRadius: (globeRadius) => set({ globeRadius }),

  rotationSpeed: 1.4,
  setRotationSpeed: (rotationSpeed) => set({ rotationSpeed }),

  interactionStrength: 0.85,
  setInteractionStrength: (interactionStrength) => set({ interactionStrength }),

  colorScheme: "COSMIC",
  setColorScheme: (colorScheme) => set({ colorScheme }),

  // Real-time Telemetry (Default startup coordinates)
  telemetry: { x: "142.001", y: "-08.442" },
  setTelemetry: (x, y) => set({ telemetry: { x, y } }),

  // MediaPipe 3D Hand Coordinates & Gestures
  handPosition: new THREE.Vector3(999, 999, 999),
  setHandPosition: (handPosition) => set({ handPosition }),

  handGesture: "NONE",
  setHandGesture: (handGesture) => set({ handGesture }),
}))
