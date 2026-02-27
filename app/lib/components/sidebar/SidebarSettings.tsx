import { SettingsItem } from "./SettingsItem";

export const SidebarSettings = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full flex-1 min-h-0 overflow-y-auto">
      <p className="md:text-xl text-lg font-medium">Settings</p>
      <SettingsItem title="Overall" items={["Email notifications"]} />
      <SettingsItem title="Account" items={["Username", "Bio", "Email"]} />
      <SettingsItem
        title="Legal"
        items={[
          "Cookies",
          "Terms of Service",
          "Privacy Policy",
          "Delete account",
        ]}
      />
    </div>
  );
};
