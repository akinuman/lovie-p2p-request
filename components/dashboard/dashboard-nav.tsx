"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/route-guard";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: AUTHENTICATED_HOME_PATH,
    label: "Outgoing",
    matchMode: "prefix",
  },
  {
    href: "/dashboard/incoming",
    label: "Incoming",
    matchMode: "prefix",
  },
  {
    href: "/requests/new",
    label: "New request",
    matchMode: "exact",
  },
] as const;

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
      className="flex flex-wrap items-center justify-end gap-2"
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
