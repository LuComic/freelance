"use client";

import type { ReactNode } from "react";
import type { FormFieldConfig, FormDraftValue } from "./formFieldTypes";
import { MAX_FORM_TEXT_ANSWER_LENGTH } from "@/lib/inputLimits";

type FormFieldRendererProps = {
  field: FormFieldConfig;
  value: FormDraftValue;
  disabled: boolean;
  onChange: (value: FormDraftValue) => void;
};

function FieldShell({
  field,
  children,
}: {
  field: FormFieldConfig;
  children: ReactNode;
}) {
  return (
    <div className="w-full flex flex-col gap-2">
      <p className="@[40rem]:text-xl text-lg font-medium">
        {field.label || "Untitled field"}
        {field.required ? (
          <span className="text-(--declined-border)"> *</span>
        ) : null}
      </p>
      {field.description ? (
        <p className="text-(--gray-page)">{field.description}</p>
      ) : null}
      {children}
    </div>
  );
}

export function FormSelectField({
  field,
  value,
  disabled,
  onChange,
}: FormFieldRendererProps) {
  const selectedOptionIds = Array.isArray(value) ? value : [];

  const toggleOption = (id: string) => {
    if (disabled) {
      return;
    }

    onChange(
      selectedOptionIds.includes(id)
        ? selectedOptionIds.filter((optionId) => optionId !== id)
        : [...selectedOptionIds, id],
    );
  };

  return (
    <FieldShell field={field}>
      {field.options.length > 0 ? (
        <div className="w-full flex flex-col gap-2">
          {field.options.map((option) => {
            const selected = selectedOptionIds.includes(option.id);

            return (
              <button
                type="button"
                key={option.id}
                className={`flex items-center gap-2 justify-start w-max @[40rem]:w-1/2  border px-2 py-1.5 ${selected ? "border-(--vibrant) bg-(--vibrant)/10" : "border-(--gray) bg-(--gray)/10"} rounded-sm`}
                onClick={() => toggleOption(option.id)}
              >
                <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-sm bg-(--darkest)">
                  {selected && (
                    <span className="bg-(--vibrant) aspect-square h-full rounded-xs" />
                  )}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-(--gray-page)">No options configured.</p>
      )}
    </FieldShell>
  );
}

export function FormRadioField({
  field,
  value,
  disabled,
  onChange,
}: FormFieldRendererProps) {
  const selectedOptionId = typeof value === "string" ? value : null;

  return (
    <FieldShell field={field}>
      {field.options.length > 0 ? (
        <div className="w-full flex flex-col gap-2">
          {field.options.map((option) => {
            const selected = selectedOptionId === option.id;

            return (
              <button
                type="button"
                key={option.id}
                className="flex items-center gap-2 justify-start w-max"
                onClick={() => {
                  if (disabled) {
                    return;
                  }

                  onChange(option.id);
                }}
              >
                <span
                  className={`h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--darkest) ${
                    selected
                      ? "border-(--vibrant) bg-(--vibrant)/10"
                      : "border-(--gray) bg-(--gray)/10"
                  } border`}
                >
                  {selected && (
                    <span className="bg-(--vibrant) aspect-square h-full rounded-full" />
                  )}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-(--gray-page)">No options configured.</p>
      )}
    </FieldShell>
  );
}

export function FormSimpleInputField({
  field,
  value,
  disabled,
  onChange,
}: FormFieldRendererProps) {
  return (
    <FieldShell field={field}>
      <div className="border-(--gray) border-t pt-2 w-full flex flex-col gap-2">
        <input
          type="text"
          placeholder={field.placeholder || "This is what i think..."}
          className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
          value={typeof value === "string" ? value : ""}
          maxLength={MAX_FORM_TEXT_ANSWER_LENGTH}
          onChange={(event) => {
            if (disabled) {
              return;
            }

            onChange(event.target.value);
          }}
        />
      </div>
    </FieldShell>
  );
}
