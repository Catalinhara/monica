import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-[0_8px_28px_var(--glow)] hover:brightness-110 active:brightness-95",
  secondary:
    "border border-[var(--border)] bg-white/[0.04] text-[var(--foreground)] backdrop-blur-sm hover:bg-white/[0.08] hover:border-[var(--accent)]/40",
  ghost:
    "text-[var(--muted)] hover:text-[var(--foreground)] underline-offset-4 hover:underline",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-sm",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-medium transition-[background,border-color,color,box-shadow,filter,transform] duration-300 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-35";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  href?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  href,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = `${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
