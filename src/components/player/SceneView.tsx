"use client";

import type { Scene } from "@/types";
import { FitMedia } from "./FitMedia";
import { normalizeDisplayText } from "@/lib/display-text";

type TextContent = {
  text?: string;
  cta?: string;
  src?: string;
  alt?: string;
};

function asContent(content: unknown): TextContent {
  if (content && typeof content === "object") {
    return content as TextContent;
  }
  if (typeof content === "string") {
    return { text: content };
  }
  return {};
}

export function SceneView({ scene }: { scene: Scene }) {
  const content = asContent(scene.content);

  if (scene.type === "image" && content.src) {
    return (
      <figure className="space-y-5 text-center">
        <FitMedia src={content.src} alt={content.alt ?? ""} />
        {content.text && (
          <figcaption className="font-display whitespace-pre-wrap text-xl leading-relaxed text-[var(--foreground)]">
            {normalizeDisplayText(content.text)}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <p className="font-display whitespace-pre-wrap text-3xl leading-snug text-[var(--foreground)] sm:text-4xl">
        {normalizeDisplayText(content.text ?? "…")}
      </p>
      {content.cta && (
        <p className="text-sm font-medium tracking-[0.12em] text-[var(--accent)] uppercase">
          {content.cta}
        </p>
      )}
    </div>
  );
}
