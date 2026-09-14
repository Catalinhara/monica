export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm tracking-[0.2em] uppercase text-[var(--color-muted)]">
        Admin Editor
      </p>
      <h1 className="text-3xl font-semibold">Lista para Fase 4</h1>
      <p className="max-w-md text-[var(--color-muted)]">
        CMS desktop-first para niveles, escenas, assets, draft/preview/publish.
        Comparte el mismo Experience Engine que el player.
      </p>
    </main>
  );
}
