import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const description =
  "Le média de référence pour l'actualité guinéenne, africaine et mondiale. Analyses, vidéos et reportages.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fogoinfos.com"),
  title: { default: "Fogoinfo", template: "%s | Fogoinfo" },
  description,
  openGraph: { type: "website", siteName: "Fogoinfo", description },
  twitter: { card: "summary_large_image" },
  appleWebApp: { title: "Fogoinfo", capable: true, statusBarStyle: "black" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
