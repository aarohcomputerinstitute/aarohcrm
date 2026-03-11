import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aaroh Institute CRM",
  description: "Professional Computer Institute Management System by Aaroh Institute – Manage inquiries, admissions, fees, attendance, and certificates.",
  keywords: "computer institute, CRM, management system, student management, fee management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
