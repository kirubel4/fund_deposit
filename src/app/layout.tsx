import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "../../providers/QueryProvider";

export const metadata: Metadata = {
  title: "HabeshaUnlocker — Deposit",
  description: "Deposit funds securely into your HabeshaUnlocker account.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
