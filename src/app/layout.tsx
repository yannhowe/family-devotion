import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Family Devotion",
    template: "%s · Family Devotion",
  },
  description:
    "A quiet place for families to read prayers and Bible verses, and to pray according to God’s will.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        <main id="content" className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
          {children}
        </main>
        <Suspense
          fallback={
            <footer className="border-t border-border">
              <div className="mx-auto h-24 w-full max-w-2xl" />
            </footer>
          }
        >
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
