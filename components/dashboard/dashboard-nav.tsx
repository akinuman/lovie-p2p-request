"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function isActiveNavItem(
  pathname: string,
  item: (typeof NAV_ITEMS)[number],
) {
  if (item.matchMode === "exact") {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Authenticated navigation"
      className="hidden items-center gap-2 sm:flex"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveNavItem(pathname, item);

        return (
          <Link
            key={item.href}
            aria-current={isActive ? "page" : undefined}
            href={item.href}
            className={cn(
              buttonVariants({
                size: "sm",
                variant: isActive ? "default" : "ghost",
              }),
              "rounded-full",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ logoutSlot }: { logoutSlot: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Lovie P2P
        </SheetTitle>
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col gap-1 pt-4"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = isActiveNavItem(pathname, item);

            return (
              <Link
                key={item.href}
                aria-current={isActive ? "page" : undefined}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border/60 pt-4">
          {logoutSlot}
        </div>
      </SheetContent>
    </Sheet>
  );
}
