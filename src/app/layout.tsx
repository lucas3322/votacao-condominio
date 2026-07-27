import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Condomínio em Conjunto | Cortinas e persianas",
  description: "Levantamento de adesão para cortinas e persianas do condomínio.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
