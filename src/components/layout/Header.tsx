"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Library, Home, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/library", icon: Library, label: "Library" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
            <Moon className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">DreamTales</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                pathname === href
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <Link
            href="/create"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 transition-all ml-1"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">New Story</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
