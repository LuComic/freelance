import { SettingsItem } from "./SettingsItem";

export const SidebarSettings = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Settings</p>
      <SettingsItem title="Overall" items={["Email notifications"]} />
      <SettingsItem
        title="Account"
        items={["Username", "Email", "Password", "2FA"]}
      />
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
