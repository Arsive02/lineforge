"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const navItems = [
  { href: "/", label: "HOME" },
  { href: "/doc2cad", label: "DOC2CAD" },
  { href: "/image2stl", label: "IMAGE2 3D" },
];

export default function Navbar() {
  const pathname = usePathname();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;
    const activeLink = navRef.current.querySelector(
      `[data-active="true"]`
    ) as HTMLElement;
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
      indicatorRef.current.style.width = `${offsetWidth}px`;
    }
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-bp-border bg-bp-bg/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-bp-accent">
            <path d="M2 12L12 2L22 12L12 22Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 12L12 7L17 12L12 17Z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span className="text-bp-accent font-bold tracking-wider text-sm">
            LINEFORGE
          </span>
        </Link>

        <div ref={navRef} className="relative flex items-center gap-1">
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-0.5 bg-bp-accent transition-all duration-300 ease-out"
          />
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive}
                className={`px-4 py-2 text-xs tracking-widest transition-colors ${
                  isActive
                    ? "text-bp-accent"
                    : "text-bp-text-muted hover:text-bp-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
