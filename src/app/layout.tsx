import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  applicationName: "GitHub Graveyard",
  creator: "GitHub Graveyard",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

const pixel = Roboto_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-pixel",
  weight: ["600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={pixel.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
