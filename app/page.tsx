"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { TopNav } from "@/components/ui/TopNav"
import { LeftHUD } from "@/components/ui/LeftHUD"
import { BottomControls } from "@/components/ui/BottomControls"
import { RightHUD } from "@/components/ui/RightHUD"
import { Globe } from "@/components/3d/Globe"
import { useSonarStore } from "@/store/useSonarStore"
import { HandTracker } from "@/components/tracking/HandTracker"

export default function Home() {
  const uiVisible = useSonarStore((state) => state.uiVisible)

  return (
    <main className="relative w-full h-screen bg-[#0a0a1a] overflow-hidden font-sans">
      {/* 3D CANVAS LAYER */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a2035] via-[#0a0a1a] to-black">
        <Canvas
          camera={{ position: [0, 0, 15], fov: 45 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <OrbitControls enableZoom={false} enablePan={false} />
          <Globe />
        </Canvas>
      </div>

      <HandTracker />
      {!uiVisible && <RightHUD />}

      {/* UI OVERLAY LAYER */}
      <div
        className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-500 ${
          uiVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-x-3 top-3 z-50 sm:inset-x-6 sm:top-6 lg:inset-x-8">
          <TopNav />
        </div>

        <div className="absolute inset-x-3 top-24 z-40 hidden flex-col gap-4 sm:inset-x-6 sm:top-28 md:top-32 lg:inset-x-8 lg:top-1/2 lg:flex lg:-translate-y-1/2 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <LeftHUD />
          <RightHUD />
        </div>

        <BottomControls />
      </div>
    </main>
  )
}
