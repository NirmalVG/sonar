import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sonar — Particle Universe",
  description: "An interactive 3D particle globe experience",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
