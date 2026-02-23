import {
  SettingsSections,
  type settingsSectionType,
} from "@/app/lib/components/settings/SettingsSections";

const SETTINGS_SECTIONS: settingsSectionType[] = [
  {
    id: "overall",
    title: "Overall",
    items: [
      { label: "Email notifications", variant: "toggle", enabled: true },
      {
        label: "News letter on updates and developments",
        variant: "toggle",
        enabled: true,
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      { label: "Username", value: "ainurakk" },
      {
        label: "Change username",
        variant: "form",
        placeholder: "Enter a new username...",
        buttonLabel: "Save",
        targetLabel: "Username",
      },
      { label: "Email", value: "ainur@example.com" },
      {
        label: "Change email",
        variant: "form",
        placeholder: "Enter a new email...",
        buttonLabel: "Save",
        targetLabel: "Email",
      },
      { label: "Password", value: "Last changed 24 days ago" },
      { label: "2FA", value: "Not enabled" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    items: [
      {
        label: "Cookies",
        variant: "legal",
        accepted: true,
        detailsLabel: "Read cookies",
        detailsHref: "/legal/cookies",
      },
      {
        label: "Terms of Service",
        variant: "legal",
        accepted: true,
        detailsLabel: "Read terms",
        detailsHref: "/legal/terms",
      },
      {
        label: "Privacy Policy",
        variant: "legal",
        accepted: true,
        detailsLabel: "Read policy",
        detailsHref: "/legal/privacy",
      },
      {
        label: "Delete account",
        value: "Delete account",
        danger: true,
      },
    ],
  },
];

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="md:text-3xl text-xl font-medium">Settings</p>
      </div>
      <p className="text-(--gray-page)">
        Manage your account preferences, app behavior, and legal settings.
      </p>
      <SettingsSections sections={SETTINGS_SECTIONS} />
    </>
  );
}
