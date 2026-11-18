import type { Metadata } from "next";
import ElectriaNav from "@/components/electria-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Electria", template: "%s | Electria" },
  description: "Book e-bikes, electric scooters, and boards from local owners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ElectriaNav />
        {children}
        <footer className="site-footer">
          <div className="container">
            <strong>Electria</strong>
            <span>Frontend demo · Changes stay in this browser</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
