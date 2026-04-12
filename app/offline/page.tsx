export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b14] px-6 text-white">
      <div className="max-w-lg rounded-3xl border border-cyan-400/20 bg-white/5 p-8 text-center shadow-[0_18px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <p className="text-[11px] font-mono tracking-[0.3em] text-cyan-300">
          OFFLINE MODE
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[0.08em] text-white">
          Sonar is temporarily offline
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/72">
          The immersive particle scene needs a network connection for the full
          live experience. Once you reconnect, refresh and Sonar will be ready
          again.
        </p>
      </div>
    </main>
  )
}
