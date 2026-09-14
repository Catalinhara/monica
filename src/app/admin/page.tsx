import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <PageHeader
        align="center"
        eyebrow="Admin Editor"
        title="Lista para la Fase 4"
        description="CMS desktop-first para niveles, escenas, assets y draft/preview/publish. Comparte el mismo Experience Engine que el player."
      />
      <Button href="/" variant="secondary">
        Volver al inicio
      </Button>
    </main>
  );
}
