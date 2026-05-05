import type { Metadata } from "next";
import { SettingsSections } from "@/app/lib/components/settings/SettingsSections";

export const metadata: Metadata = {
  title: "Pageboard | Settings",
  description:
    "Manage your Pageboard account preferences, app behavior, and legal settings.",
};

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Settings</p>
      </div>
      <p className="text-(--gray-page)">
        Manage your account preferences, app behavior, and legal settings.
      </p>
      <SettingsSections />
    </>
  );
}
