import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brand } from "@rsc/config";

export const metadata: Metadata = {
  title: `${brand.name} · Social Commerce`,
  description: `TikTok @${brand.social.tiktokHandle} and Facebook Reels commerce for ${brand.name}.`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Figtree:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
