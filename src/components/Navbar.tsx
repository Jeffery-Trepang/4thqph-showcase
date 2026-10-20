"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/services", label: "Services" },
  { href: "/register", label: "Register" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-md">
      <nav className="mx-auto grid h-16 max-w-6xl grid-cols-[auto_1fr] items-center gap-3 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        {/* Left: logo */}
        <Link
          href="/"
          aria-label="4th Quarter Performance & Health home"
          className="flex h-12 shrink-0 items-center justify-self-start"
        >
          <img
            src="/4Q_Logo.png"
            alt="4Q Logo"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Center: nav links (horizontally centered) */}
        <ul className="flex items-center justify-self-center gap-4 sm:gap-8">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-semibold uppercase tracking-wide transition-colors hover:text-roseGold ${
                    active ? "text-roseGold" : "text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right: address + email (hidden below md / 768px) */}
        <div className="hidden flex-col items-end justify-self-end leading-tight md:flex">
          <a
            href="https://maps.google.com/?q=1269+St.+Clair+Ave.+West,+Toronto,+ON,+M6R+1P1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-right text-xs text-white transition-colors hover:text-roseGold"
          >
            1269 St. Clair Ave. West
            <br />
            Toronto, ON, M6R 1P1
          </a>
          <a
            href="mailto:4thquarterph@gmail.com"
            className="text-[11px] text-white transition-colors hover:text-roseGold"
          >
            4thquarterph@gmail.com
          </a>
        </div>
      </nav>
    </header>
  );
}
