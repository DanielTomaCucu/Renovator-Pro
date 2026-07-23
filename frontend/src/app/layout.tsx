import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "material-symbols/outlined.css";
import "./globals.css";
import { AuthProvider } from "@/shared/AuthProvider";
import AppShell from "@/components/AppShell";
import PwaRegister from "@/components/PwaRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin", "latin-ext"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Renovator Pro — Planificator Buget Renovare",
  description: "Management de buget pentru renovări. Arhitectură și precizie.",
  // PWA pe iOS: Safari nu citește `manifest.webmanifest` pentru comportamentul de „aplicație" (bară de
  // status, mod standalone) — are nevoie de aceste meta tag-uri `apple-mobile-web-app-*` separate.
  appleWebApp: {
    capable: true,
    title: "Renovator Pro",
    statusBarStyle: "black-translucent",
  },
};

/** `themeColor` NU mai stă în `metadata` (breaking change Next 14+) — export separat obligatoriu. */
export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${inter.variable} ${hanken.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <PwaRegister />
        {/* AuthProvider deasupra a tot (Faza 5) — AppShell decide, pe baza sesiunii, dacă randează
            /login-/register „goale" sau Sidebar+StoreProvider (vezi components/AppShell.tsx). */}
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
