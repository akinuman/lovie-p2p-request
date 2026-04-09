"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/dashboard/outgoing",
    label: "Outgoing",
  },
  {
    href: "/dashboard/incoming",
    label: "Incoming",
  },
  {
    href: "/requests/new",
    label: "New request",
  },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
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
