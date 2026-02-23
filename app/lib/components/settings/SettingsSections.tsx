"use client";

import { useSearchParams } from "next/navigation";
import { PageSectionDropdown } from "./PageSectionDropdown";

export type settingsSectionType = {
  id: "overall" | "account" | "legal";
  title: "Overall" | "Account" | "Legal";
  items: {
    label: string;
    value?: string;
    variant?: "form" | "legal" | "toggle";
    placeholder?: string;
    buttonLabel?: string;
    targetLabel?: string;
    accepted?: boolean;
    detailsLabel?: string;
    detailsHref?: string;
    danger?: boolean;
    enabled?: boolean;
  }[];
};

export const SettingsSections = ({
  sections,
}: {
  sections: settingsSectionType[];
}) => {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  return (
    <div className="flex flex-col items-start justify-start w-full">
      {sections.map((item, index) => (
        <PageSectionDropdown
          key={`${item.id}-${section === item.id ? "open" : "closed"}`}
          item={item}
          index={index}
          defaultOpen={section === item.id}
        />
      ))}
    </div>
  );
};
