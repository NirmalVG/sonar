import { ReactNode } from "react"

interface GlassPanelProps {
  children: ReactNode
  className?: string
}

export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div
      className={`
        bg-black/40 
        backdrop-blur-xl 
        border border-white/10 
        rounded-2xl 
        shadow-2xl shadow-black/50
        pointer-events-auto
        ${className}
      `}
    >
      {children}
    </div>
  )
}
