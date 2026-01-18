import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";

export const metadata: Metadata = {
  title: "UZEED",
  description: "Plataforma de contenido con suscripción"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen">
          <Navbar />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
