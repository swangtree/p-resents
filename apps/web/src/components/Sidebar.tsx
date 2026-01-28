'use client'; 
// Added to enable usePathname hook

import Link from "next/link";
import { usePathname } from 'next/navigation'; // <-- NEW IMPORT
import RainbowText from "./RainbowText";

const NAV_ITEMS = [
  { name: "Home", href: "/", color: "text-pareto-pink", decorationColor: "decoration-pareto-pink" },
  { name: "Demo", href: "/demo", color: "text-pareto-yellow", decorationColor: "decoration-pareto-yellow" },
  { name: "Dashboard", href: "/dashboard", color: "text-pareto-orange", decorationColor: "decoration-pareto-orange" },
  { name: "Results", href: "/results", color: "text-pareto-green", decorationColor: "decoration-pareto-green" },
  { name: "About", href: "/about", color: "text-pareto-blue", decorationColor: "decoration-pareto-blue" },
  { name: "Settings", href: "/settings", color: "text-pareto-light", decorationColor: "decoration-pareto-light" },
];

export default function Sidebar() {
  const pathname = usePathname(); // <-- NEW: Get current path

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-pareto-dark p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-12">
        <Link href="/" className="no-underline">
          <RainbowText text="Pareto Presents :)" className="text-2xl" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href; // <-- NEW: Check if link is active
            
            return (
                <Link
                    key={item.name}
                    href={item.href}
                    // Apply different styles if active
                    className={`
                        font-display text-xl no-underline transition-all
                        ${item.color}
                        ${isActive
                            ? `underline decoration-wavy decoration-2 ${item.decorationColor} font-bold opacity-100` // Active style with squiggle
                            : "hover:opacity-80" // Inactive style
                        }
                    `}
                >
                    {item.name}
                </Link>
            );
        })}
      </nav>
    </aside>
  );
}