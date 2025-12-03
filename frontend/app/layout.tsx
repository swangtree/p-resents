import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const mrsPickles = localFont({
  src: [
    {
      path: "../public/fonts/MrsPickles-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/MrsPickles-Regular.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-mrs-pickles",
});

export const metadata: Metadata = {
  title: "Pareto Presents",
  description: "Helping you and your friends gift give (more optimally)",
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
        {children}
      </body>
    </html>
  );
}
