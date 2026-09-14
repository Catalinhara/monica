import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="mb-3 text-sm tracking-[0.2em] uppercase text-[var(--color-muted)]">
          Fase 0 — Scaffold
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Romantic Journey
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
          Experiencia interactiva data-driven. El motor, los niveles y el editor
          se construirán por fases sobre este scaffold.
        </p>
      </div>

      <nav className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/play"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-accent)] px-8 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Player Experience
        </Link>
        <Link
          href="/admin"
          className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-8 text-sm font-medium transition-colors hover:bg-white/5"
        >
          Admin Editor
        </Link>
      </nav>
    </main>
  );
}
