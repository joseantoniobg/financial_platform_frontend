import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plataforma Consultoria João Melo",
  description: "Uma plataforma financeira completa para gerenciar suas finanças pessoais e investimentos.",
  icons: {
    icon: '/logo.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: '',
              style: {
                background: 'hsl(var(--nav-background))',
                color: 'hsl(var(--nav-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: '#B4F481',
                  secondary: 'hsl(var(--background))',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'hsl(var(--card-foreground))',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
