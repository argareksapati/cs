import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/components/data-provider";

export const metadata: Metadata = {
  title: "Customer Service | Kota Bandung",
  description: "Portal operasional layanan dan permohonan warga Kota Bandung.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
