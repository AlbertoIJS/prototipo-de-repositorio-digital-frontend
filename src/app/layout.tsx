import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthCheck } from "@/components/AuthCheck";
import { Toaster } from "sonner";

import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prototipo de repositorio digital",
  description:
    "Prototipo de repositorio digital para alumnos de la Escuela superior de computo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        <Toaster richColors />
        <AuthCheck>
          <div className="min-h-svh flex flex-col">{children}</div>
        </AuthCheck>
      </body>
    </html>
  );
}
