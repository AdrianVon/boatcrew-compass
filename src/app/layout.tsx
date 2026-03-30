import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Boatcrew Compass",
  description:
    "A one-page map for how you'll move through the year. Based on Daniel Pink's 2026: Designed.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Boatcrew Compass",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
