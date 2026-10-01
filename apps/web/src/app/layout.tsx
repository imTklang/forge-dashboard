import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// Pesos usados: 400 (corpo), 500 (rótulos, botões), 600 (títulos e números).
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-sans", display: "swap", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Forge",
  description: "Dashboard pessoal de programador",
};

export const viewport: Viewport = {
  themeColor: "#171513",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${bricolage.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
          Pular para o conteúdo
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
