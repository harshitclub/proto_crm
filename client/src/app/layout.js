import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({ weight: "400", subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "proto_crm",
  description: "3a CRM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={raleway.className}>{children}</body>
    </html>
  );
}
