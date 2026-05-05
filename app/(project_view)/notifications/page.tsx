import type { Metadata } from "next";
import { NotificationsPageClient } from "@/app/lib/components/notifications/NotificationsPageClient";

export const metadata: Metadata = {
  title: "Pageboard | Notifications",
  description:
    "Review recent Pageboard project notifications, invites, and workspace activity updates.",
};

export default function Page() {
  return <NotificationsPageClient />;
}
