import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldClass =
  "w-full rounded-xl border border-[var(--border)] bg-black/25 px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]/60";

const labelClass =
  "mb-1.5 block text-xs font-medium tracking-wide text-[var(--muted)]";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className={labelClass}>{children}</label>;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${fieldClass} min-h-28 resize-y font-[family-name:var(--font-mono)] text-xs leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function TextSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${fieldClass} ${props.className ?? ""}`} />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-0">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}
