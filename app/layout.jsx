import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GeoFlag",
  description:
    "Navigate the complexity of global regulations with GeoComply, a private LLM-powered compliance assistant. Designed for global apps like TikTok, GeoComply provides real-time visibility into region-specific legal obligations across the US (Utah, Florida, California), EU, and beyond."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
