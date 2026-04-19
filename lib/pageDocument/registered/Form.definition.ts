import { defineRegisteredPageComponentDefinition } from "../registeredDefinitions";
import { isRecord } from "../utils";

export const FORM_FIELD_TYPES = ["Select", "Radio", "SimpleInput"] as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

export type FormFieldOption = {
  id: string;
  label: string;
};

export type FormFieldConfig = {
  id: string;
  type: FormFieldType;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  options: FormFieldOption[];
};

export type FormConfig = {
  fields: FormFieldConfig[];
};

export type FormState = Record<string, never>;

export function isFormFieldType(value: unknown): value is FormFieldType {
  return FORM_FIELD_TYPES.includes(value as FormFieldType);
}

function normalizeFormFieldOptions(
  value: unknown,
  fieldType: FormFieldType,
): FormFieldOption[] {
  if (fieldType === "SimpleInput" || !Array.isArray(value)) {
    return [];
  }

  return value
    .map((option, index) => {
      if (!isRecord(option) || typeof option.label !== "string") {
        return null;
      }

      const label = option.label.trim();

      if (!label) {
        return null;
      }

      return {
        id:
          typeof option.id === "string" && option.id.trim()
            ? option.id.trim()
            : `option_${index + 1}`,
        label,
      };
    })
    .filter((option): option is FormFieldOption => option !== null);
}

function normalizeFormFields(value: unknown, fallback: FormFieldConfig[]) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return value
    .map((field, index) => {
      if (!isRecord(field) || !isFormFieldType(field.type)) {
        return null;
      }

      return {
        id:
          typeof field.id === "string" && field.id.trim()
            ? field.id.trim()
            : `field_${index + 1}`,
        type: field.type,
        label: typeof field.label === "string" ? field.label : "",
        description:
          typeof field.description === "string" ? field.description : "",
        placeholder:
          typeof field.placeholder === "string" ? field.placeholder : "",
        required: field.required === true,
        options: normalizeFormFieldOptions(field.options, field.type),
      };
    })
    .filter((field): field is FormFieldConfig => field !== null);
}

export const FormDefinition = defineRegisteredPageComponentDefinition({
  type: "Form",
  commands: ["form"],
  createDefaultConfig: (): FormConfig => ({
    fields: [],
  }),
  createDefaultState: (): FormState => ({}),
  normalizeConfig: (value, fallback) => {
    if (!isRecord(value)) {
      return fallback;
    }

    return {
      fields: normalizeFormFields(value.fields, fallback.fields),
    };
  },
  normalizeState: (value, fallback) => {
    if (isRecord(value)) {
      return {};
    }

    return fallback;
  },
  componentLibrary: {
    name: "Form",
    description: "Collect individual client responses. Command: /form",
    previewSrc: "/component-previews/form.svg",
    tag: "input",
    limited: true,
  },
});
