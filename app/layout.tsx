import type { Metadata } from "next";
import "./globals.css";
import { ScrollToTop } from "./scroll-top";

export const metadata: Metadata = {
  title: "Lunara Boutique | Moda femenina en Puerto Rico, Misiones",
  description:
    "Ropa importada y nacional, carteras y accesorios. Consultá productos y armá tu pedido por WhatsApp.",
  other: { "codex-preview": "development" },
  icons: {
    icon: "/logo-lunara.png",
    shortcut: "/logo-lunara.png",
  },
  openGraph: {
    title: "Lunara Boutique",
    description: "Moda femenina, ropa importada y nacional, carteras y accesorios.",
    images: ["/logo-lunara.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
