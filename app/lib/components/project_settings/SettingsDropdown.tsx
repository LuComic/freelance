"use client";

import type { settingsDropdownItemType } from "@/app/project_1/settings/page";
import { ChevronRight, Trash } from "lucide-react";
import { useState } from "react";

export const SettingsDropdown = ({
  item,
  index,
}: {
  item: settingsDropdownItemType;
  index: number;
}) => {
  const [isOpen, setOpen] = useState(false);
  const [fieldValues, setFieldValues] = useState(() =>
    item.fields.map((field) => field.value),
  );
  const [fieldInputs, setFieldInputs] = useState<string[]>(
    item.fields.map(() => ""),
  );

  const deleteTag = (fieldIndex: number, tag: string) => {
    setFieldValues((prev) =>
      prev.map((values, index) =>
        index === fieldIndex ? values.filter((value) => value !== tag) : values,
      ),
    );
  };

  const addFieldValue = (fieldIndex: number) => {
    const nextValue = fieldInputs[fieldIndex]?.trim();
    if (!nextValue) return;

    let targetFieldIndex = fieldIndex;

    if (item.fields[fieldIndex].variant === "form") {
      const exactTitleTarget = item.fields.findIndex((field) => {
        if (field.variant === "form") return false;
        if (
          item.fields[fieldIndex].title === "Manage clients" &&
          field.title === "Current clients"
        ) {
          return true;
        }
        if (
          item.fields[fieldIndex].title === "Manage co-creators" &&
          field.title === "Current co-creators"
        ) {
          return true;
        }
        if (
          item.fields[fieldIndex].title === "Rename project" &&
          field.title === "Project name"
        ) {
          return true;
        }
        return false;
      });

      if (exactTitleTarget !== -1) {
        targetFieldIndex = exactTitleTarget;
      } else {
        const previousFieldIndex = fieldIndex - 1;
        if (previousFieldIndex >= 0) {
          targetFieldIndex = previousFieldIndex;
        }
      }
    }

    setFieldValues((prev) =>
      prev.map((values, index) =>
        index === targetFieldIndex
          ? item.fields[targetFieldIndex].title === "Project name"
            ? [nextValue]
            : [nextValue, ...values]
          : values,
      ),
    );
    setFieldInputs((prev) =>
      prev.map((value, index) => (index === fieldIndex ? "" : value)),
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
        {item.section}
      </button>

      {isOpen ? (
        <div className="pl-7 flex flex-col gap-2 pb-2">
          {item.fields.map((field, fieldIndex) => (
            <div
              key={`${field.title}-${fieldIndex}`}
              className="w-full flex flex-col gap-2"
            >
              <p className="text-(--gray-page)">{field.title}</p>
              {field.variant === "tags" ? (
                <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                  {fieldValues[fieldIndex].map((value) => (
                    <div
                      key={value}
                      className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                    >
                      {value}
                      <button
                        type="button"
                        className="hover:bg-(--gray)/20 p-1 rounded-sm"
                        onClick={() => deleteTag(fieldIndex, value)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : field.variant === "form" ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder={field.placeholder ?? "Add item..."}
                    className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                    value={fieldInputs[fieldIndex]}
                    onChange={(e) =>
                      setFieldInputs((prev) =>
                        prev.map((value, index) =>
                          index === fieldIndex ? e.target.value : value,
                        ),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addFieldValue(fieldIndex);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="w-max rounded-md px-2.5 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                    onClick={() => addFieldValue(fieldIndex)}
                  >
                    Add
                  </button>
                </div>
              ) : field.danger ? (
                <div className="flex flex-col gap-2">
                  {fieldValues[fieldIndex].map((value, valueIndex) => (
                    <button
                      key={`${value}-${valueIndex}`}
                      className={`w-max rounded-md border px-2.5 py-1 ${
                        field.danger
                          ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
                          : "border-(--gray)"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {fieldValues[fieldIndex].map((value, valueIndex) => (
                    <div
                      key={`${value}-${valueIndex}`}
                      className="w-max rounded-md border px-2.5 py-1 border-(--gray)"
                    >
                      {value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
