"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/browse", label: "Browse" },
  { href: "/bookings", label: "Bookings" },
  { href: "/host", label: "Rent out" },
];

export default function ElectriaNav() {
  const path = usePathname();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Electria home">
          <span className="brand-symbol" aria-hidden="true">
            ϟ
          </span>
          Electria
        </Link>
        <nav aria-label="Main navigation">
          {nav.map(({ href, label }) => {
            const active =
              path === href ||
              (href === "/browse" &&
                (path === "/" || path.startsWith("/listings/")));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="nav-link"
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
