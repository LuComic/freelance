"use client";

import { useState } from "react";
import { ChevronRight, Trash } from "lucide-react";
import type { PageComponentInstanceByType } from "@/lib/pageDocument";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FORM_FIELD_TYPE_OPTIONS,
  createDefaultFormField,
  createFormOptionId,
  getFormFieldLabel,
  getFormFieldTypeLabel,
  type FormFieldConfig,
  type FormFieldType,
} from "./formFieldTypes";

type FormCreatorProps = {
  config: PageComponentInstanceByType<"Form">["config"];
  onChangeConfig: (
    updater: (
      config: PageComponentInstanceByType<"Form">["config"],
    ) => PageComponentInstanceByType<"Form">["config"],
  ) => void;
};

const FILTER_BUTTON_CLASS_NAME =
  "flex items-center text-sm md:text-base justify-center gap-1 w-full @[40rem]:w-max rounded-md px-2 py-1 border hover:bg-(--gray)/20";

export const FormCreator = ({ config, onChangeConfig }: FormCreatorProps) => {
  const [openFieldIds, setOpenFieldIds] = useState<Set<string>>(new Set());
  const [addingField, setAddingField] = useState(false);
  const [fieldTypeToAdd, setFieldTypeToAdd] = useState<FormFieldType>("Select");
  const [optionInputs, setOptionInputs] = useState<Record<string, string>>({});

  const updateField = (
    fieldId: string,
    updater: (field: FormFieldConfig) => FormFieldConfig,
  ) => {
    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      fields: currentConfig.fields.map((field) =>
        field.id === fieldId ? updater(field) : field,
      ),
    }));
  };

  const deleteField = (fieldId: string) => {
    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      fields: currentConfig.fields.filter((field) => field.id !== fieldId),
    }));
    setOpenFieldIds((currentOpenFieldIds) => {
      const nextOpenFieldIds = new Set(currentOpenFieldIds);
      nextOpenFieldIds.delete(fieldId);
      return nextOpenFieldIds;
    });
  };

  const toggleFieldOpen = (fieldId: string) => {
    setOpenFieldIds((currentOpenFieldIds) => {
      const nextOpenFieldIds = new Set(currentOpenFieldIds);

      if (nextOpenFieldIds.has(fieldId)) {
        nextOpenFieldIds.delete(fieldId);
      } else {
        nextOpenFieldIds.add(fieldId);
      }

      return nextOpenFieldIds;
    });
  };

  const handleAddField = () => {
    const nextField = createDefaultFormField(fieldTypeToAdd);

    onChangeConfig((currentConfig) => ({
      ...currentConfig,
      fields: [...currentConfig.fields, nextField],
    }));
    setOpenFieldIds((currentOpenFieldIds) =>
      new Set(currentOpenFieldIds).add(nextField.id),
    );
  };

  const setOptionInput = (fieldId: string, value: string) => {
    setOptionInputs((currentInputs) => ({
      ...currentInputs,
      [fieldId]: value,
    }));
  };

  const handleAddOption = (field: FormFieldConfig) => {
    const nextLabel = optionInputs[field.id]?.trim() ?? "";

    if (!nextLabel) {
      return;
    }

    updateField(field.id, (currentField) => ({
      ...currentField,
      options: [
        ...currentField.options,
        {
          id: createFormOptionId(),
          label: nextLabel,
        },
      ],
    }));
    setOptionInput(field.id, "");
  };

  const handleDeleteOption = (fieldId: string, optionId: string) => {
    updateField(fieldId, (currentField) => ({
      ...currentField,
      options: currentField.options.filter((option) => option.id !== optionId),
    }));
  };

  const setFieldRequired = (fieldId: string, required: boolean) => {
    updateField(fieldId, (currentField) => ({
      ...currentField,
      required,
    }));
  };

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium mt-2">Form</p>
      <p className="text-(--gray-page)">
        Collect individual client submissions without changing the shared page
        state.
      </p>

      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-2">
        <button
          type="button"
          className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 w-full"
          onClick={() => setAddingField((prev) => !prev)}
        >
          Add Field
          <ChevronRight
            size={18}
            className={addingField ? "rotate-90" : ""}
          />
        </button>
        {addingField ? (
          <>
            <Select
              value={fieldTypeToAdd}
              onValueChange={(value) =>
                setFieldTypeToAdd(value as FormFieldType)
              }
            >
              <SelectTrigger className="w-full @[40rem]:w-52 bg-(--dim) border-(--gray-page)">
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
                <SelectGroup className="bg-(--dim)">
                  {FORM_FIELD_TYPE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.type}
                      value={option.type}
                      className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light)"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <button
              type="button"
              className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
              onClick={handleAddField}
            >
              Add field
            </button>
          </>
        ) : null}

        <div className="w-full h-px bg-(--gray)" />

        {config.fields.length > 0 ? (
          config.fields.map((field, index) => {
            const fieldOpen = openFieldIds.has(field.id);

            return (
              <div key={field.id} className="w-full flex flex-col gap-2">
                <div
                  className={`w-full h-px bg-(--gray) ${index === 0 ? "hidden" : "block"}`}
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="@[40rem]:text-lg text-base font-medium flex items-center justify-start gap-2 min-w-0"
                    onClick={() => toggleFieldOpen(field.id)}
                  >
                    <ChevronRight
                      size={18}
                      className={fieldOpen ? "rotate-90" : ""}
                    />
                    <span className="min-w-0 wrap-break-word text-left">
                      {getFormFieldLabel(field)}
                    </span>
                    <span className="text-(--gray-page) font-normal">
                      {getFormFieldTypeLabel(field.type)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="h-6.5 flex items-center justify-center aspect-square rounded-md hover:bg-(--darkest-hover) bg-(--dim) border-(--gray-page) border"
                    onClick={() => deleteField(field.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>

                {fieldOpen ? (
                  <>
                    <input
                      type="text"
                      placeholder="Field title..."
                      className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                      value={field.label}
                      onChange={(event) =>
                        updateField(field.id, (currentField) => ({
                          ...currentField,
                          label: event.target.value,
                        }))
                      }
                    />
                    <input
                      type="text"
                      placeholder="Field description..."
                      className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                      value={field.description}
                      onChange={(event) =>
                        updateField(field.id, (currentField) => ({
                          ...currentField,
                          description: event.target.value,
                        }))
                      }
                    />
                    {field.type === "SimpleInput" ? (
                      <input
                        type="text"
                        placeholder="Field placeholder..."
                        className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                        value={field.placeholder}
                        onChange={(event) =>
                          updateField(field.id, (currentField) => ({
                            ...currentField,
                            placeholder: event.target.value,
                          }))
                        }
                      />
                    ) : null}
                    {field.type !== "SimpleInput" ? (
                      <>
                        <input
                          type="text"
                          placeholder="Add a new option..."
                          className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                          value={optionInputs[field.id] ?? ""}
                          onChange={(event) =>
                            setOptionInput(field.id, event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleAddOption(field);
                            }
                          }}
                        />

                        <button
                          type="button"
                          className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                          onClick={() => handleAddOption(field)}
                        >
                          Add
                        </button>

                        <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                          {field.options.length > 0 ? (
                            field.options.map((option) => (
                              <div
                                key={option.id}
                                className="max-w-full min-w-0 pl-2 pr-1.5 py-1 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1 wrap-break-word hover:bg-(--gray)/20"
                              >
                                <span className="min-w-0 wrap-break-word">
                                  {option.label}
                                </span>
                                <button
                                  type="button"
                                  className="hover:bg-(--gray)/20 p-1 rounded-sm"
                                  onClick={() =>
                                    handleDeleteOption(field.id, option.id)
                                  }
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-(--gray-page)">
                              No options setup
                            </span>
                          )}
                        </div>
                      </>
                    ) : null}

                    <div className="grid grid-cols-2 @[40rem]:flex items-center justify-start w-full gap-1 md:gap-2">
                      <button
                        type="button"
                        className={`${FILTER_BUTTON_CLASS_NAME} ${
                          !field.required &&
                          "text-(--gray-page) border-(--gray-page)"
                        }`}
                        onClick={() => setFieldRequired(field.id, true)}
                      >
                        Required
                      </button>
                      <button
                        type="button"
                        className={`${FILTER_BUTTON_CLASS_NAME} ${
                          field.required &&
                          "text-(--gray-page) border-(--gray-page)"
                        }`}
                        onClick={() => setFieldRequired(field.id, false)}
                      >
                        Optional
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            );
          })
        ) : (
          <span className="text-(--gray-page)">No fields setup</span>
        )}
      </div>
    </>
  );
};
