import "./globals.css";
import type { Metadata } from "next";
import { SITE_URL } from "./lib/seo";

const PREVIEW_IMAGE_URL = `${SITE_URL}/preview.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Pageboard",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
  },
  openGraph: {
    siteName: "Pageboard",
    images: [
      {
        url: PREVIEW_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Pageboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [PREVIEW_IMAGE_URL],
  },
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pageboard",
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        {children}
      </body>
    </html>
  );
}
