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
          gl={{ preserveDrawingBuffer: true }} // <--- ADD THIS
        >
          <OrbitControls enableZoom={false} enablePan={false} />
          <Globe />
        </Canvas>
      </div>

      {/* UI OVERLAY LAYER */}
      <div
        className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-500 ${
          uiVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <TopNav />
        <LeftHUD />
        <HandTracker />
        <RightHUD />
        <BottomControls />
      </div>
    </main>
  )
}
