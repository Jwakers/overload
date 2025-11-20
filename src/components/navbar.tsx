"use client";

import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { Dumbbell, Home, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const navItems = [
  {
    name: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    name: "Splits",
    href: ROUTES.SPLITS,
    icon: Dumbbell,
  },
  {
    name: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNavHeight = () => {
      const navHeight = navbarRef.current?.clientHeight;

      if (!navHeight) return;
      document.documentElement.style.setProperty(
        "--nav-height",
        `${navHeight}px`
      );
    };

    // Initial update
    updateNavHeight();

    // Create a MutationObserver to watch for changes to the navbar and its children
    const observer = new MutationObserver(() => {
      updateNavHeight();
    });

    // Start observing the navbar element
    if (navbarRef.current) {
      observer.observe(navbarRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    // Cleanup
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="bg-background border-t border-border safe-area-inset-bottom"
      ref={navbarRef}
    >
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
          {pathname !== ROUTES.WORKOUT ? (
            // TODO: refine with transition rather than conditional rendering
            <Link
              href={ROUTES.WORKOUT}
              className="relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
              title="Log workout"
              aria-label="Log workout"
            >
              <div className="p-4 rounded-full bg-brand text-brand-foreground shadow-lg">
                <Plus size={24} className={"text-brand-foreground"} />
              </div>
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
