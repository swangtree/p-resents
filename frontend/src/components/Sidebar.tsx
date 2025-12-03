'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import RainbowText from "./RainbowText";

const NAV_ITEMS = [
  { name: "Home", href: "/", color: "text-pareto-pink" },
  { name: "Dashboard", href: "/dashboard", color: "text-pareto-yellow" },
  { name: "Results", href: "/results", color: "text-pareto-orange" },
  { name: "About", href: "/about", color: "text-pareto-green" },
  { name: "Settings", href: "/settings", color: "text-pareto-blue" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile and auto-collapse
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [pathname, isMobile]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-pareto-dark rounded-md hover:bg-opacity-80 transition-all"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-[200px] bg-pareto-dark p-6 flex flex-col
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="mb-12 mt-12">
          <Link href="/" className="no-underline">
            <RainbowText text="Pareto Presents :)" className="text-2xl" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  font-display text-xl no-underline transition-all
                  ${item.color} 
                  ${isActive 
                    ? "underline decoration-4 decoration-white/70 font-bold opacity-100"
                    : "hover:opacity-80"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}