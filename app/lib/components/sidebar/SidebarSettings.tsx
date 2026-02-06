import { SidebarItem } from "./SidebarItem";

export const SidebarSettings = () => {
  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full">
      <p className="md:text-xl text-lg font-medium">Settings</p>
      <SidebarItem
        title="Overall"
        items={["Profile", "Preferences", "Account status"]}
        settings={true}
      />
      <SidebarItem
        title="Account"
        items={["Account information", "Account status"]}
        settings={true}
      />
      <SidebarItem
        title="Legal"
        items={["Cookies", "Privacy", "Terms and Conditions"]}
        settings={true}
      />
    </div>
  );
};
