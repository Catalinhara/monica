import type { CSSProperties, ReactNode } from "react";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
  interactive?: boolean;
  style?: CSSProperties;
};

/** Interaction container — used for selectable rows / controls, not decorative cards. */
export function Surface({
  children,
  className = "",
  as: Tag = "div",
  interactive = false,
  style,
}: SurfaceProps) {
  return (
    <Tag
      style={style}
      className={`rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] backdrop-blur-[2px] ${
        interactive
          ? "transition-[border-color,background] duration-300 hover:border-[var(--accent)]/45 hover:bg-white/[0.06]"
          : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
