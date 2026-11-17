import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nivel de Burbuja y Brújula — API",
  description: "API Backend desplegada en Vercel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
