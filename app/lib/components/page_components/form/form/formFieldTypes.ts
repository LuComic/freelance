import type {
  FormFieldConfig,
  FormFieldOption,
  FormFieldType,
} from "@/lib/pageDocument/registered/Form.definition";

export type { FormFieldConfig, FormFieldOption, FormFieldType };

export type FormDraftValue = string | string[] | null;
export type FormDraftValues = Record<string, FormDraftValue>;

export const FORM_FIELD_TYPE_OPTIONS: Array<{
  type: FormFieldType;
  label: string;
}> = [
  { type: "Select", label: "Select" },
  { type: "Radio", label: "Radio" },
  { type: "SimpleInput", label: "Simple Input" },
];

export function createFormFieldId() {
  return `field_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function createFormOptionId() {
  return `option_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function getFormFieldTypeLabel(type: FormFieldType) {
  return FORM_FIELD_TYPE_OPTIONS.find((option) => option.type === type)?.label ?? type;
}

export function getFormFieldLabel(field: FormFieldConfig) {
  return field.label.trim() || "Untitled field";
}

export function createDefaultFormField(
  type: FormFieldType,
): FormFieldConfig {
  const id = createFormFieldId();

  switch (type) {
    case "Select":
      return {
        id,
        type,
        label: "Select field",
        description: "",
        placeholder: "",
        required: false,
        options: [],
      };
    case "Radio":
      return {
        id,
        type,
        label: "Radio field",
        description: "",
        placeholder: "",
        required: false,
        options: [],
      };
    case "SimpleInput":
      return {
        id,
        type,
        label: "Text field",
        description: "",
        placeholder: "Write your answer...",
        required: false,
        options: [],
      };
  }
}

export function getEmptyDraftValue(field: FormFieldConfig): FormDraftValue {
  switch (field.type) {
    case "Select":
      return [];
    case "Radio":
    case "SimpleInput":
      return null;
  }
}
