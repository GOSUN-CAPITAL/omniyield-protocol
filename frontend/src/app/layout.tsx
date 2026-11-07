import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniYield Protocol | GOSUN OmniYield USDC on NEAR",
  description: "Autonomous multi-market yield optimizer on NEAR powered by dynamic supply queues, Burrow isolated lending & Ondo US Treasuries RWA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

