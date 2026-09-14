import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div
        className="flex w-full max-w-xl flex-col items-center gap-10"
        style={{ animation: "fade-rise 0.7s var(--ease-out-expo) both" }}
      >
        <PageHeader
          align="center"
          eyebrow="Romantic Journey"
          title="Una historia hecha para ti"
          description="Experiencia interactiva data-driven: motor de niveles, estética romántica y un editor para personalizar cada escena."
        />

        <nav className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button href="/play" size="lg">
            Empezar el viaje
          </Button>
          <Button href="/admin" variant="secondary" size="lg">
            Admin Editor
          </Button>
        </nav>
      </div>
    </main>
  );
}
