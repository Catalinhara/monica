import type { ReactNode } from "react";
import { parseBoldSegments } from "@/lib/display-text";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  align?: "left" | "center";
};

function RichText({ value }: { value: string }) {
  return (
    <>
      {parseBoldSegments(value).map((part, index) =>
        part.bold ? (
          <strong key={index} className="font-semibold">
            {part.text}
          </strong>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  align = "left",
}: Props) {
  const alignClass =
    align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <header className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <p className="text-[0.7rem] font-medium tracking-[0.28em] uppercase text-[var(--muted)]">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl leading-[1.1] text-[var(--foreground)] sm:text-5xl">
        <RichText value={title} />
      </h1>
      {description && (
        <p className="max-w-md whitespace-pre-line text-base leading-relaxed text-[var(--muted)]">
          <RichText value={description} />
        </p>
      )}
      {children}
    </header>
  );
}
