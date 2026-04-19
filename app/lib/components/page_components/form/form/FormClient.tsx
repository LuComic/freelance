"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import type { PageComponentInstanceByType } from "@/lib/pageDocument";
import {
  getViewerFormSubmissionQuery,
  submitFormMutation,
} from "@/lib/convexFunctionReferences";
import {
  FormRadioField,
  FormSelectField,
  FormSimpleInputField,
} from "./formFieldRenderers";
import {
  getEmptyDraftValue,
  getFormFieldLabel,
  type FormDraftValue,
  type FormDraftValues,
  type FormFieldConfig,
} from "./formFieldTypes";

type ViewerFormSubmission = {
  viewerRole: "owner" | "coCreator" | "client";
  canSubmit: boolean;
  submission: null | {
    id: string;
    updatedAt: number;
    answers: Array<{
      fieldId: string;
      fieldTypeSnapshot: "Select" | "Radio" | "SimpleInput";
      value: FormDraftValue;
      displayValue: string;
    }>;
  };
};

type FormClientProps = {
  pageId: string;
  formInstanceId: string;
  config: PageComponentInstanceByType<"Form">["config"];
};

function createEmptyDraft(fields: FormFieldConfig[]): FormDraftValues {
  return Object.fromEntries(
    fields.map((field) => [field.id, getEmptyDraftValue(field)]),
  );
}

function createDraftFromSubmission(
  fields: FormFieldConfig[],
  submission: ViewerFormSubmission["submission"],
) {
  const nextDraft = createEmptyDraft(fields);
  const answersByFieldId = new Map(
    submission?.answers.map((answer) => [answer.fieldId, answer]) ?? [],
  );

  for (const field of fields) {
    const answer = answersByFieldId.get(field.id);

    if (!answer) {
      continue;
    }

    switch (field.type) {
      case "SimpleInput":
        nextDraft[field.id] =
          typeof answer.value === "string" ? answer.value : null;
        break;
      case "Select": {
        const validOptionIds = new Set(
          field.options.map((option) => option.id),
        );
        nextDraft[field.id] = Array.isArray(answer.value)
          ? answer.value.filter((optionId) => validOptionIds.has(optionId))
          : [];
        break;
      }
      case "Radio":
        nextDraft[field.id] =
          typeof answer.value === "string" &&
          field.options.some((option) => option.id === answer.value)
            ? answer.value
            : null;
        break;
    }
  }

  return nextDraft;
}

function prepareDraftValue(field: FormFieldConfig, value: FormDraftValue) {
  switch (field.type) {
    case "SimpleInput":
      return typeof value === "string" && value.trim() ? value.trim() : null;
    case "Select":
      return Array.isArray(value) ? value : [];
    case "Radio":
      return typeof value === "string" ? value : null;
  }
}

function validateDraft(
  fields: FormFieldConfig[],
  draftValues: FormDraftValues,
) {
  for (const field of fields) {
    const value = draftValues[field.id] ?? getEmptyDraftValue(field);

    if (field.type === "SimpleInput") {
      const textValue = typeof value === "string" ? value.trim() : "";

      if (textValue.length > 5000) {
        return "Text answers must be 5000 characters or less.";
      }

      if (field.required && !textValue) {
        return `Please answer ${getFormFieldLabel(field)}.`;
      }
    }

    if (field.type === "Select") {
      const selectedValues = Array.isArray(value) ? value : [];

      if (field.required && selectedValues.length === 0) {
        return `Please answer ${getFormFieldLabel(field)}.`;
      }
    }

    if (field.type === "Radio" && field.required && typeof value !== "string") {
      return `Please answer ${getFormFieldLabel(field)}.`;
    }
  }

  return null;
}

export const FormClient = ({
  pageId,
  formInstanceId,
  config,
}: FormClientProps) => {
  const viewerSubmission = useQuery(getViewerFormSubmissionQuery, {
    pageId: pageId as never,
    formInstanceId,
  }) as ViewerFormSubmission | undefined;
  const submitForm = useMutation(submitFormMutation);
  const [draftValues, setDraftValues] = useState<FormDraftValues>(() =>
    createEmptyDraft(config.fields),
  );
  const [submitting, setSubmitting] = useState(false);
  const [hasLocalSubmission, setHasLocalSubmission] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submissionKey = viewerSubmission?.submission
    ? `${viewerSubmission.submission.id}:${viewerSubmission.submission.updatedAt}`
    : "empty";
  const canSubmit = viewerSubmission?.canSubmit === true;
  const hasSubmission =
    viewerSubmission?.submission !== null &&
    viewerSubmission?.submission !== undefined
      ? true
      : hasLocalSubmission;

  useEffect(() => {
    setDraftValues(
      createDraftFromSubmission(
        config.fields,
        viewerSubmission?.submission ?? null,
      ),
    );
    setHasLocalSubmission(
      viewerSubmission?.submission !== null &&
        viewerSubmission?.submission !== undefined,
    );
    setErrorMessage(null);
  }, [config.fields, submissionKey, viewerSubmission?.submission]);

  const updateDraftValue = (fieldId: string, value: FormDraftValue) => {
    setDraftValues((currentDraftValues) => ({
      ...currentDraftValues,
      [fieldId]: value,
    }));
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    const validationError = validateDraft(config.fields, draftValues);

    if (validationError) {
      setErrorMessage(validationError);
      setStatusMessage(null);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      await submitForm({
        pageId: pageId as never,
        formInstanceId,
        answers: config.fields.map((field) => ({
          fieldId: field.id,
          value: prepareDraftValue(
            field,
            draftValues[field.id] ?? getEmptyDraftValue(field),
          ),
        })),
      });
      setHasLocalSubmission(true);
      setStatusMessage(hasSubmission ? "Form resubmitted." : "Form submitted.");
    } catch (error) {
      setStatusMessage(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not submit form.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium">Form</p>
      <p className="text-(--gray-page)">
        Fill out this form and submit your individual response.
      </p>

      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-4">
        {config.fields.length > 0 ? (
          config.fields.map((field) => {
            const value = draftValues[field.id] ?? getEmptyDraftValue(field);

            if (field.type === "Select") {
              return (
                <FormSelectField
                  key={field.id}
                  field={field}
                  value={value}
                  disabled={!canSubmit || submitting}
                  onChange={(nextValue) =>
                    updateDraftValue(field.id, nextValue)
                  }
                />
              );
            }

            if (field.type === "Radio") {
              return (
                <FormRadioField
                  key={field.id}
                  field={field}
                  value={value}
                  disabled={!canSubmit || submitting}
                  onChange={(nextValue) =>
                    updateDraftValue(field.id, nextValue)
                  }
                />
              );
            }

            return (
              <FormSimpleInputField
                key={field.id}
                field={field}
                value={value}
                disabled={!canSubmit || submitting}
                onChange={(nextValue) => updateDraftValue(field.id, nextValue)}
              />
            );
          })
        ) : (
          <p className="text-(--gray-page)">No fields configured.</p>
        )}
      </div>

      {viewerSubmission === undefined ? (
        <p className="text-(--gray-page)">Loading form...</p>
      ) : !canSubmit ? null : (
        <button
          type="button"
          className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting
            ? "Submitting..."
            : hasSubmission
              ? "Resubmit form"
              : "Submit form"}
        </button>
      )}

      {statusMessage ? (
        <p className="text-(--accepted-border)">{statusMessage}</p>
      ) : null}
      {errorMessage ? (
        <p className="text-(--declined-border)">{errorMessage}</p>
      ) : null}
    </>
  );
};
