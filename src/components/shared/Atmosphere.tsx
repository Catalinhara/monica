export function Atmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{ background: "var(--atmosphere-gradient)" }}
      />
      <div
        className="atmosphere-motion absolute -top-[20%] left-[10%] h-[55vmin] w-[55vmin] rounded-full blur-3xl"
        style={{
          background: "var(--orb-1)",
          animation: "float-orb 18s ease-in-out infinite",
        }}
      />
      <div
        className="atmosphere-motion absolute -right-[10%] bottom-[5%] h-[45vmin] w-[45vmin] rounded-full blur-3xl"
        style={{
          background: "var(--orb-2)",
          animation: "float-orb 22s ease-in-out infinite reverse",
        }}
      />
      <div
        className="atmosphere-motion absolute inset-0 opacity-[var(--grain-opacity)] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
          animation: "grain-shift 8s steps(2) infinite",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}
