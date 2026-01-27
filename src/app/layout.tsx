import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Testimonio - La voz de tus clientes, amplificada",
  description: "Recolectá testimonios reales de tus clientes y mostralos donde importa. Simple, cálido, efectivo.",
  keywords: ["testimonios", "reviews", "social proof", "conversiones", "LATAM"],
  openGraph: {
    title: "Testimonio - La voz de tus clientes, amplificada",
    description: "Recolectá testimonios reales y mostralos donde importa.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
