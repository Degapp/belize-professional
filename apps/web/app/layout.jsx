'use client';

import "./globals.css";
import "@/utils/route-change-detector";
import { AppGenProvider } from "@/components/appgen-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Belize Professional</title>
        <meta name="description" content="Built with AppGen" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@300,400,500,600,700&f[]=satoshi@300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.2/src/light/style.css" />
      </head>
      <body className="antialiased">
        <AppGenProvider>{children}</AppGenProvider>
      </body>
    </html>
  );
}
