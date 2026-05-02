import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Catanist",
  description: "Master Catan strategy with community-created puzzles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
