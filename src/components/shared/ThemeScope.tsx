"use client";

import type { CSSProperties, ReactNode } from "react";
import { resolveTheme, themeToCssVars } from "@/lib/themes";

type Props = {
  themeId?: string;
  children: ReactNode;
  className?: string;
};

export function ThemeScope({ themeId, children, className = "" }: Props) {
  const theme = resolveTheme(themeId);
  const style = themeToCssVars(theme) as CSSProperties;

  return (
    <div className={className} style={style} data-theme={theme.id}>
      {children}
    </div>
  );
}
