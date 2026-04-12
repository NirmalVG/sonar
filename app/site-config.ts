export const siteConfig = {
  name: "Sonar - Particle Universe",
  shortName: "Sonar",
  description:
    "An interactive 3D particle universe with hand tracking, gesture control, and cinematic real-time motion.",
  creator: "Visionary Projects",
  socialHandle: "@visionaryprojects",
  ogAlt:
    "Sonar logo and glowing particle field preview for the Sonar interactive particle universe.",
}

export function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"

  return new URL(siteUrl)
}
