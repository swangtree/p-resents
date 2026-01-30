import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const mrsPickles = localFont({
  src: [
    {
      path: "../../public/fonts/MrsPickles-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/MrsPickles-Regular.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-mrs-pickles",
});

export const metadata: Metadata = {
  title: {
    default: "Pareto Presents - Smart Gift Exchange Matching",
    template: "%s | Pareto Presents",
  },
  description:
    "Algorithmic gift exchange matching for Secret Santa and White Elephant. Use smart algorithms to match givers with receivers based on preferences, interests, and compatibility.",
  keywords: [
    "gift exchange",
    "secret santa",
    "white elephant",
    "gift matching",
    "algorithm",
    "pareto",
    "holiday",
    "gift giving",
    "matching algorithm",
    "hungarian algorithm",
  ],
  authors: [{ name: "Pareto Presents" }],
  creator: "Pareto Presents",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://p-resents.vercel.app"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Pareto Presents",
    title: "Pareto Presents - Smart Gift Exchange Matching",
    description:
      "Algorithmic gift exchange matching for Secret Santa and White Elephant. Use smart algorithms to match givers with receivers based on preferences and interests.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pareto Presents - Smart Gift Exchange Matching",
    description:
      "Algorithmic gift exchange matching for Secret Santa and White Elephant.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} ${mrsPickles.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
