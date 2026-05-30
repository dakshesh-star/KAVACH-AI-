import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Kavach — AI Shield Against Digital Scams",
  description:
    "Kavach is your AI-powered shield against digital scams. Detect, understand, and recover from online fraud with deep psychological analysis.",
  keywords: ["scam detection", "cybersecurity", "AI", "fraud prevention", "India"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
