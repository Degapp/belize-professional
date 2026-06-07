'use client';

import "./globals.css";
import "@/utils/route-change-detector";
import { AppGenProvider } from "@/components/appgen-provider";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function AuthWrapper({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Skip auth check for public routes
    const publicRoutes = ['/', '/login', '/signup', '/features', '/pricing', '/about', '/contact', '/professionals'];
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, pathname, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mx-auto mb-4 animate-pulse">
            <i className="ph-light ph-squares-four text-2xl font-bold"></i>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show children only if authenticated or on public routes
  const publicRoutes = ['/', '/login', '/signup', '/features', '/pricing', '/about', '/contact', '/professionals'];
  if (isAuthenticated || publicRoutes.includes(pathname)) {
    return children;
  }

  return null;
}

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
        <AppGenProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </AppGenProvider>
      </body>
    </html>
  );
}
