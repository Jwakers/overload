"use client";

import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { Dumbbell, Home, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Splits",
      href: "/splits",
      icon: Dumbbell,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="bg-background border-t border-border safe-area-inset-bottom">
      <nav className="container py-1">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col text-muted-foreground items-center justify-center min-w-0 hover:bg-accent rounded-lg flex-1 py-2 px-1 transition-all duration-200",
                  pathname === item.href && "bg-muted text-foreground"
                )}
              >
                <div className="p-1 rounded-full transition-all duration-200">
                  <Icon size={20} />
                </div>
                <span className="text-xs mt-1 font-medium transition-colors duration-200">
                  {item.name}
                </span>
              </Link>
            );
          })}
          <Link
            href={ROUTES.WORKOUT}
            className="relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
            title="Log workout"
          >
            <div className="p-4 rounded-full bg-brand text-brand-foreground shadow-lg">
              <Plus size={24} className={"text-brand-foreground"} />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
