import { SettingsDropdown } from "@/app/lib/components/settings/SettingsDropdown";

export type settingsDropdownItemType = {
  section: string;
  fields: {
    title: string;
    value: string[];
    danger?: boolean;
    variant?: "tags" | "form";
    placeholder?: string;
  }[];
};

const PROJECT_SETTINGS: settingsDropdownItemType[] = [
  {
    section: "General",
    fields: [
      {
        title: "Project name",
        value: ["Freelance Website Redesign"],
      },
      {
        title: "Rename project",
        value: [],
        variant: "form",
        placeholder: "Enter a new project name...",
      },
    ],
  },
  {
    section: "Clients",
    fields: [
      {
        title: "Current clients",
        value: ["alice@client.co", "brand-team@client.co"],
        variant: "tags",
      },
      {
        title: "Manage clients",
        value: [],
        variant: "form",
        placeholder: "Add a client email...",
      },
    ],
  },
  {
    section: "Co-creators",
    fields: [
      {
        title: "Current co-creators",
        value: ["marco@studio.co", "sara@studio.co"],
        variant: "tags",
      },
      {
        title: "Manage co-creators",
        value: [],
        variant: "form",
        placeholder: "Add a co-creator email...",
      },
    ],
  },
  {
    section: "Danger zone",
    fields: [
      {
        title: "Delete project",
        value: ["Delete project"],
        danger: true,
      },
    ],
  },
];

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="md:text-3xl text-xl font-medium">Project Settings</p>
      </div>
      <p className="text-(--gray-page)">
        Manage project details, collaborators, and platform settings for this
        workspace.
      </p>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="md:text-xl text-lg font-medium">Settings</p>
      </div>
      <div className="flex flex-col items-start justify-start w-full">
        {PROJECT_SETTINGS.map((item, index) => (
          <SettingsDropdown key={index} item={item} index={index} />
        ))}
      </div>
    </>
  );
}
