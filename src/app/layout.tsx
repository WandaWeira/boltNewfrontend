// src/app/layout.tsx
import React from "react";
import localFont from "next/font/local";
import "./globals.css";
import SessionWrapper from "@/app/components/SessionWrapper";
import ClientLayoutSwitch from "@/app/components/ClientLayoutSwitch";

// Define local fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Define metadata as a plain object
export const metadata = {
  title: "NRM Election management",
  description: "Election management system for NRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body>
          <ClientLayoutSwitch>{children}</ClientLayoutSwitch>
        </body>
      </html>
    </SessionWrapper>
  );
}
