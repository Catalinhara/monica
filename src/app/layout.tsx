import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Atmosphere } from "@/components/shared/Atmosphere";
import { SkipLink } from "@/components/shared/SkipLink";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Para Mónica",
  description: "Una historia hecha para ti.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#120810",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col overflow-x-hidden pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <SkipLink />
        <Atmosphere />
        <div
          id="main-content"
          className="relative z-10 flex min-h-full flex-1 flex-col"
          tabIndex={-1}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
