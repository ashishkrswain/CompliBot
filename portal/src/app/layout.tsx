import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompliBot — AI-Powered Industrial Compliance",
  description: "Generate complete compliance reports, filings, and documentation for OSHA, EPA, and maintenance regulations. AI handles 90% of the work autonomously.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
