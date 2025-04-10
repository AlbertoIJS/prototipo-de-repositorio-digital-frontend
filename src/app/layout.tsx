import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthCheck } from "@/components/AuthCheck";

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
        <AuthCheck>{children}</AuthCheck>
      </body>
    </html>
  );
}
