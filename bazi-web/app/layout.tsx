import type { Metadata } from "next";
import "./globals.css";
import AuthHeader from "@/components/AuthHeader";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Bazi Web AI - 探索命运的奥秘",
  description: "结合中华传统命理与人工智能，提供专业的八字排盘与流年运势推演服务。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="zh-CN">
      <body
        className={`antialiased bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden select-none font-sans`}
      >
        {/* Global Minimalist Background */}
        <div className="fixed inset-0 bg-background pointer-events-none z-0" />

        <AuthHeader user={user} />
        <main className="flex-1 relative z-10 pt-16">{children}</main>
      </body>
    </html>
  );
}
