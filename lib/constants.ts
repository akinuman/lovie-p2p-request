import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/route-guard";

export const NAV_ITEMS = [
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

export const AMOUNT_PRESETS = [5, 10, 50] as const;
