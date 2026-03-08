import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BlueprintGrid from "@/components/layout/BlueprintGrid";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LineForge — Document to CAD & 3D",
  description:
    "Convert documents to CAD-style line art and images to 3D models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <BlueprintGrid />
        <Navbar />
        <main className="relative z-10 pt-14">{children}</main>
      </body>
    </html>
  );
}
