import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "material-symbols/outlined.css";
import "./globals.css";
import { StoreProvider } from "@/shared/store";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

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
        {/* Sidebar-ul și BottomNav-ul NU folosesc useStore() — rămân în afara StoreProvider ca să fie
            vizibile și navigabile cât timp datele se încarcă (backend-ul poate avea cold-start de zeci
            de secunde). */}
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1 pb-16 md:pb-0">
            <StoreProvider>{children}</StoreProvider>
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
