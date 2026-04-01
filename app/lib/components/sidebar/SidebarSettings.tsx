import type { Dispatch, SetStateAction } from "react";
import { SettingsItem } from "./SettingsItem";

type SidebarSettingsProps = {
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
};

export const SidebarSettings = ({ setSidebarOpen }: SidebarSettingsProps) => {
  return (
    <div className="flex flex-col gap-1 items-start justify-start w-full flex-1 min-h-0 overflow-y-auto">
      <p className="md:text-xl text-lg font-medium">Settings</p>
      <SettingsItem
        title="Account"
        items={["Username", "Bio", "Email", "Delete account"]}
        setSidebarOpen={setSidebarOpen}
      />
      {/* <SettingsItem title="Plan" items={["Free", "Starter", "Pro Unlimited"]} /> */}
      <SettingsItem
        title="Limits"
        items={["Limits for all users"]}
        setSidebarOpen={setSidebarOpen}
      />
      <SettingsItem
        title="Legal"
        items={["Cookies", "Terms of Service", "Privacy Policy"]}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
};
