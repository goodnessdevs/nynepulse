import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

const poppins = Poppins({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "NynePulse — IoT Device Management",
  description:
    "Self-hostable IoT device management API. Connect any device, stream live telemetry, send commands, and fire threshold alerts.",
  keywords: ["IoT", "device management", "NestJS", "real-time", "telemetry"],
  authors: [{ name: "Geenine", url: "https://github.com/goodnessdevs" }],
  openGraph: {
    title: "NynePulse",
    description: "Self-hostable IoT device management for developers.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
