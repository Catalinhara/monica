export type ThemeId =
  | "romantic-night"
  | "soft-sunset"
  | "burgundy"
  | "dreamy"
  | "minimal";

export type ThemeTokens = {
  id: ThemeId;
  name: string;
  colors: {
    background: string;
    backgroundAlt: string;
    foreground: string;
    accent: string;
    accentSoft: string;
    muted: string;
    border: string;
    glow: string;
  };
  atmosphere: {
    gradient: string;
    orb1: string;
    orb2: string;
    grainOpacity: number;
  };
};

export const THEMES: Record<ThemeId, ThemeTokens> = {
  "romantic-night": {
    id: "romantic-night",
    name: "Romantic Night",
    colors: {
      background: "#120810",
      backgroundAlt: "#1a0f18",
      foreground: "#f7eef4",
      accent: "#d46a86",
      accentSoft: "rgba(212, 106, 134, 0.18)",
      muted: "#b39aab",
      border: "rgba(247, 238, 244, 0.12)",
      glow: "rgba(212, 106, 134, 0.35)",
    },
    atmosphere: {
      gradient:
        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,106,134,0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(88,40,70,0.45), transparent 50%), linear-gradient(165deg, #120810 0%, #1a0f18 45%, #0c070b 100%)",
      orb1: "rgba(212, 106, 134, 0.2)",
      orb2: "rgba(90, 45, 80, 0.35)",
      grainOpacity: 0.06,
    },
  },
  "soft-sunset": {
    id: "soft-sunset",
    name: "Soft Sunset",
    colors: {
      background: "#2a1520",
      backgroundAlt: "#3a1c28",
      foreground: "#fff4ef",
      accent: "#e8916a",
      accentSoft: "rgba(232, 145, 106, 0.2)",
      muted: "#d4b0a4",
      border: "rgba(255, 244, 239, 0.14)",
      glow: "rgba(232, 145, 106, 0.35)",
    },
    atmosphere: {
      gradient:
        "radial-gradient(ellipse 90% 55% at 20% 0%, rgba(232,145,106,0.28), transparent 50%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(180,70,90,0.25), transparent 45%), linear-gradient(180deg, #2a1520, #1c1018)",
      orb1: "rgba(232, 145, 106, 0.25)",
      orb2: "rgba(180, 70, 90, 0.2)",
      grainOpacity: 0.05,
    },
  },
  burgundy: {
    id: "burgundy",
    name: "Burgundy",
    colors: {
      background: "#1a080c",
      backgroundAlt: "#2a1016",
      foreground: "#f8ecee",
      accent: "#a33b52",
      accentSoft: "rgba(163, 59, 82, 0.22)",
      muted: "#c49aa5",
      border: "rgba(248, 236, 238, 0.12)",
      glow: "rgba(163, 59, 82, 0.4)",
    },
    atmosphere: {
      gradient:
        "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(163,59,82,0.3), transparent 55%), linear-gradient(160deg, #1a080c, #12060a 60%, #2a1016)",
      orb1: "rgba(163, 59, 82, 0.28)",
      orb2: "rgba(80, 20, 35, 0.4)",
      grainOpacity: 0.07,
    },
  },
  dreamy: {
    id: "dreamy",
    name: "Dreamy",
    colors: {
      background: "#14101c",
      backgroundAlt: "#1c1628",
      foreground: "#f2eef8",
      accent: "#c4a0d8",
      accentSoft: "rgba(196, 160, 216, 0.18)",
      muted: "#a89bb8",
      border: "rgba(242, 238, 248, 0.12)",
      glow: "rgba(196, 160, 216, 0.3)",
    },
    atmosphere: {
      gradient:
        "radial-gradient(ellipse 80% 50% at 70% 10%, rgba(196,160,216,0.22), transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(100,80,140,0.25), transparent 45%), linear-gradient(180deg, #14101c, #0e0b14)",
      orb1: "rgba(196, 160, 216, 0.22)",
      orb2: "rgba(100, 80, 140, 0.28)",
      grainOpacity: 0.05,
    },
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    colors: {
      background: "#161416",
      backgroundAlt: "#1e1b1e",
      foreground: "#f4f1f2",
      accent: "#e8d5d8",
      accentSoft: "rgba(232, 213, 216, 0.12)",
      muted: "#9e9498",
      border: "rgba(244, 241, 242, 0.14)",
      glow: "rgba(232, 213, 216, 0.2)",
    },
    atmosphere: {
      gradient: "linear-gradient(180deg, #1a1719 0%, #121012 100%)",
      orb1: "rgba(232, 213, 216, 0.08)",
      orb2: "rgba(80, 70, 75, 0.15)",
      grainOpacity: 0.04,
    },
  },
};

export function resolveTheme(id?: string): ThemeTokens {
  if (id && id in THEMES) return THEMES[id as ThemeId];
  return THEMES["romantic-night"];
}

export function themeToCssVars(theme: ThemeTokens): Record<string, string> {
  return {
    "--background": theme.colors.background,
    "--background-alt": theme.colors.backgroundAlt,
    "--foreground": theme.colors.foreground,
    "--accent": theme.colors.accent,
    "--accent-soft": theme.colors.accentSoft,
    "--muted": theme.colors.muted,
    "--border": theme.colors.border,
    "--glow": theme.colors.glow,
    "--atmosphere-gradient": theme.atmosphere.gradient,
    "--orb-1": theme.atmosphere.orb1,
    "--orb-2": theme.atmosphere.orb2,
    "--grain-opacity": String(theme.atmosphere.grainOpacity),
  };
}
