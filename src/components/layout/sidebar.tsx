"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Globe, ScanSearch, Zap } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sites", label: "Sites", icon: Globe },
  { href: "/scans", label: "Scan History", icon: ScanSearch },
  { href: "/scan", label: "Manual Scan", icon: Zap },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-xl">♿</span>
        <span className="font-bold text-lg tracking-tight">A11y Monitor</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">WCAG 2.1 AA • Powered by axe-core</p>
      </div>
    </aside>
  );
}
