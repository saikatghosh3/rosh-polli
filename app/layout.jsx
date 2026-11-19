import "./globals.css";
import InitialLoader from "@/components/layout/initial-loader";
import { getSiteSettings } from "@/lib/storefront-data";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const brandName = settings.brandName || "রসপল্লী";
  const title = settings.seoTitle || `${brandName} — কেজুর গুর ও রসের নিজস্ব ঠিকানা`;
  const description = settings.seoDescription || settings.tagline || "রসপল্লী-র যত্নে বেছে নেওয়া কেজুর গুর ও রসে খুঁজে নিন শীতের সবচেয়ে আসল মিষ্টি।";
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: title, template: `%s | ${brandName}` },
    description,
    applicationName: `${brandName} ${settings.brandDescriptor || "কেজুর গুর ও রসের ঠিকানা"}`,
    openGraph: {
      type: "website",
      locale: "bn_BD",
      siteName: brandName,
      title,
      description,
      images: [{ url: "/images/hero-date-palm.jpg", width: 1200, height: 800, alt: `${brandName}-র নির্বাচিত কেজুর গুর ও রস` }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/images/hero-date-palm.jpg"] },
    robots: { index: true, follow: true },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport = {
  colorScheme: "light",
  themeColor: "#faf8f3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <InitialLoader />
        {children}
      </body>
    </html>
  );
}
