"use client";

import type { settingsSectionType } from "@/app/lib/components/settings/SettingsSections";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export const PageSectionDropdown = ({
  item,
  index,
  defaultOpen = false,
}: {
  item: settingsSectionType;
  index: number;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setOpen] = useState(defaultOpen);
  const [itemValues, setItemValues] = useState(() =>
    item.items.map((sectionItem) => sectionItem.value ?? ""),
  );
  const [itemInputs, setItemInputs] = useState<string[]>(
    item.items.map(() => ""),
  );
  const [legalAccepted, setLegalAccepted] = useState<boolean[]>(
    item.items.map((sectionItem) => sectionItem.accepted ?? false),
  );
  const [toggleEnabled, setToggleEnabled] = useState<boolean[]>(
    item.items.map((sectionItem) => sectionItem.enabled ?? false),
  );

  const submitForm = (itemIndex: number) => {
    const nextValue = itemInputs[itemIndex]?.trim();
    if (!nextValue) return;

    const targetLabel = item.items[itemIndex].targetLabel;
    const targetIndex =
      targetLabel != null
        ? item.items.findIndex(
            (sectionItem) =>
              sectionItem.label === targetLabel &&
              sectionItem.variant !== "form",
          )
        : itemIndex - 1;

    if (targetIndex < 0) return;

    setItemValues((prev) =>
      prev.map((value, index) => (index === targetIndex ? nextValue : value)),
    );
    setItemInputs((prev) =>
      prev.map((value, index) => (index === itemIndex ? "" : value)),
    );
  };

  return (
    <div
      className={`${index % 2 !== 0 && "bg-(--gray)/10"} w-full p-2 flex flex-col gap-2`}
    >
      <button
        type="button"
        className="flex font-medium md:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight
          size={20}
          className={`${isOpen ? "rotate-90" : "rotate-0"}`}
        />
        {item.title}
      </button>

      {isOpen ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          {item.items.map((sectionItem, itemIndex) => (
            <div
              key={`${sectionItem.label}-${itemIndex}`}
              className="w-full flex flex-col gap-2"
            >
              <p className="text-(--gray-page)">{sectionItem.label}</p>
              {sectionItem.variant === "form" ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder={sectionItem.placeholder ?? "Enter value..."}
                    className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                    value={itemInputs[itemIndex]}
                    onChange={(e) =>
                      setItemInputs((prev) =>
                        prev.map((value, index) =>
                          index === itemIndex ? e.target.value : value,
                        ),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        submitForm(itemIndex);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="w-max rounded-md px-2.5 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                    onClick={() => submitForm(itemIndex)}
                  >
                    {sectionItem.buttonLabel ?? "Save"}
                  </button>
                </div>
              ) : sectionItem.variant === "toggle" ? (
                <div className="flex flex-col gap-2">
                  <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
                    {toggleEnabled[itemIndex] ? "Enabled" : "Disabled"}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={`w-max rounded-md border px-2.5 py-1 ${
                        toggleEnabled[itemIndex]
                          ? "border-(--accepted-border) bg-(--accepted-bg)/10 hover:bg-(--accepted-bg)/20"
                          : "border-(--gray) hover:bg-(--gray)/20"
                      }`}
                      onClick={() =>
                        setToggleEnabled((prev) =>
                          prev.map((value, index) =>
                            index === itemIndex ? true : value,
                          ),
                        )
                      }
                    >
                      Enable
                    </button>
                    <button
                      type="button"
                      className={`w-max rounded-md border px-2.5 py-1 ${
                        !toggleEnabled[itemIndex]
                          ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                          : "border-(--gray) hover:bg-(--gray)/20"
                      }`}
                      onClick={() =>
                        setToggleEnabled((prev) =>
                          prev.map((value, index) =>
                            index === itemIndex ? false : value,
                          ),
                        )
                      }
                    >
                      Disable
                    </button>
                  </div>
                </div>
              ) : sectionItem.variant === "legal" ? (
                <div className="flex flex-col gap-2">
                  <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
                    {legalAccepted[itemIndex] ? "Accepted" : "Not accepted"}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={`w-max rounded-md border px-2.5 py-1 ${
                        legalAccepted[itemIndex]
                          ? "border-(--accepted-border) bg-(--accepted-bg)/10 hover:bg-(--accepted-bg)/20"
                          : "border-(--gray) hover:bg-(--gray)/20"
                      }`}
                      onClick={() =>
                        setLegalAccepted((prev) =>
                          prev.map((value, index) =>
                            index === itemIndex ? true : value,
                          ),
                        )
                      }
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className={`w-max rounded-md border px-2.5 py-1 ${
                        !legalAccepted[itemIndex]
                          ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                          : "border-(--gray) hover:bg-(--gray)/20"
                      }`}
                      onClick={() =>
                        setLegalAccepted((prev) =>
                          prev.map((value, index) =>
                            index === itemIndex ? false : value,
                          ),
                        )
                      }
                    >
                      Deny
                    </button>
                    <Link
                      href={sectionItem.detailsHref ?? "#"}
                      className="w-max rounded-md border px-2.5 py-1 border-(--gray) hover:bg-(--gray)/20"
                    >
                      {sectionItem.detailsLabel ?? "See details"}
                    </Link>
                  </div>
                </div>
              ) : sectionItem.danger ? (
                <button
                  type="button"
                  className="w-max rounded-md border px-2.5 py-1 border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                >
                  {itemValues[itemIndex]}
                </button>
              ) : (
                <div className="w-full rounded-md border px-2 py-1 border-(--gray) wrap-break-word">
                  {itemValues[itemIndex]}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
