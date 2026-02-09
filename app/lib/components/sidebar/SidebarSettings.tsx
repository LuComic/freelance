import { SettingsItem } from "./SettingsItem";

export const SidebarSettings = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Settings</p>
      <SettingsItem
        title="Overall"
        items={["Profile", "Preferences", "Account status"]}
      />
      <SettingsItem
        title="Account"
        items={["Account information", "Account status"]}
      />
      <SettingsItem
        title="Legal"
        items={["Cookies", "Privacy", "Terms and Conditions"]}
      />
    </div>
  );
};
