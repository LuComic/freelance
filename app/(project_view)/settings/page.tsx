import { SettingsSections } from "@/app/lib/components/settings/SettingsSections";

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="md:text-3xl text-xl font-medium">Settings</p>
      </div>
      <p className="text-(--gray-page)">
        Manage your account preferences, app behavior, and legal settings.
      </p>
      <SettingsSections />
    </>
  );
}
