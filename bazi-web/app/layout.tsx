import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthHeader from "@/components/AuthHeader";
import { getSessionUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bazi Web AI",
  description: "AI-powered Bazi Application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-zinc-100 min-h-screen flex flex-col overflow-x-hidden`}
      >
        {/* Global Minimalist Background */}
        <div className="fixed inset-0 bg-black pointer-events-none z-0" />

        <AuthHeader user={user} />
        <main className="flex-1 relative z-10 pt-16">{children}</main>
      </body>
    </html>
  );
}
