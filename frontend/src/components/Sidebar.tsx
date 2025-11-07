import Link from "next/link";
import RainbowText from "./RainbowText";
import Dashboard from "@/app/dashboard";
import React from "react";
import { BrowserRouter as Router, Route} from "react-router-dom";

const NAV_ITEMS = [
  { name: "Home", href: "/", color: "text-pareto-pink" },
  { name: "Dashboard", href: "/dashboard", color: "text-pareto-yellow" },
  { name: "Results", href: "/results", color: "text-pareto-orange" },
  { name: "About", href: "/about", color: "text-pareto-green" },
  { name: "Settings", href: "/settings", color: "text-pareto-blue" },
];

export default function Sidebar() {
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
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`font-display text-xl ${item.color} no-underline hover:opacity-80 transition-opacity`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
