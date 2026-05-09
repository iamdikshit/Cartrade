import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CarTrade — Buy & Sell Cars",
    template: "%s | CarTrade",
  },
  description:
    "Find your perfect car. Browse inspected vehicles with detailed auction reports, full condition history, and transparent pricing.",
  keywords: [
    "used cars",
    "buy car",
    "sell car",
    "car auction",
    "car inspection",
    "pre-owned vehicles",
  ],
  authors: [{ name: "CarTrade" }],
  creator: "CarTrade",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "CarTrade",
    title: "CarTrade — Buy & Sell Cars",
    description: "Find your perfect car with detailed inspection reports",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarTrade",
    description: "Buy & Sell Cars with confidence",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ea580c" },
    { media: "(prefers-color-scheme: dark)", color: "#c2410c" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "var(--font-body)",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "white" },
            },
            error: {
              iconTheme: { primary: "#dc2626", secondary: "white" },
            },
          }}
        />
      </body>
    </html>
  );
}
