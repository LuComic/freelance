import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { requireCurrentAuth } from "../lib/auth";
import { invalidState } from "../lib/errors";
import { assertMaxLength } from "../lib/inputValidation";
import { requirePageAccess, requireProjectMember } from "../lib/permissions";
import { buildProjectMemberDisplayName } from "../projects/model";
import { parsePageDocument } from "../pages/content";
import type { FormFieldConfig } from "../../lib/pageDocument/registered/Form.definition";
import {
  MAX_FORM_FIELDS,
  MAX_FORM_TEXT_ANSWER_LENGTH,
  MAX_OPTIONS_PER_FIELD,
} from "../../lib/inputLimits";

const NO_ANSWER_DISPLAY_VALUE = "No answer.";

type FormSubmissionAnswerValue = string | string[] | null;
type SubmittedAnswer = {
  fieldId: string;
  value: FormSubmissionAnswerValue;
};
type FormSubmissionAnswer = Doc<"formSubmissions">["answers"][number];

const formAnswerValueValidator = v.union(
  v.string(),
  v.array(v.string()),
  v.null(),
);

function getFieldLabel(field: FormFieldConfig) {
  return field.label.trim() || "Untitled field";
}

function normalizeSubmittedAnswers(answers: SubmittedAnswer[]) {
  return new Map(answers.map((answer) => [answer.fieldId, answer.value]));
}

function validateNoUnknownFields(
  formFields: FormFieldConfig[],
  submittedAnswers: SubmittedAnswer[],
) {
  const knownFieldIds = new Set(formFields.map((field) => field.id));

  for (const answer of submittedAnswers) {
    if (!knownFieldIds.has(answer.fieldId)) {
      throw invalidState("This form changed. Refresh and try again.");
    }
  }
}

function buildSimpleInputAnswer(
  field: FormFieldConfig,
  value: FormSubmissionAnswerValue | undefined,
): FormSubmissionAnswer {
  const answerValue = typeof value === "string" ? value.trim() : "";

  assertMaxLength(answerValue, MAX_FORM_TEXT_ANSWER_LENGTH, "Text answers");

  if (field.required && !answerValue) {
    throw invalidState(`Please answer ${getFieldLabel(field)}.`);
  }

  return {
    fieldId: field.id,
    fieldTypeSnapshot: field.type,
    fieldLabelSnapshot: getFieldLabel(field),
    value: answerValue ? answerValue : null,
    displayValue: answerValue || NO_ANSWER_DISPLAY_VALUE,
  };
}

function buildSelectAnswer(
  field: FormFieldConfig,
  value: FormSubmissionAnswerValue | undefined,
): FormSubmissionAnswer {
  const submittedOptionIds = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : [];
  if (submittedOptionIds.length > MAX_OPTIONS_PER_FIELD) {
    throw invalidState(
      `Select answers can include up to ${MAX_OPTIONS_PER_FIELD} options.`,
    );
  }

  const optionsById = new Map(
    field.options.map((option) => [option.id, option]),
  );
  const selectedOptionIds = submittedOptionIds.filter((optionId, index) => {
    return (
      typeof optionId === "string" &&
      optionsById.has(optionId) &&
      submittedOptionIds.indexOf(optionId) === index
    );
  });

  if (field.required && selectedOptionIds.length === 0) {
    throw invalidState(`Please answer ${getFieldLabel(field)}.`);
  }

  const selectedLabels = selectedOptionIds
    .map((optionId) => optionsById.get(optionId)?.label)
    .filter((label): label is string => typeof label === "string");

  return {
    fieldId: field.id,
    fieldTypeSnapshot: field.type,
    fieldLabelSnapshot: getFieldLabel(field),
    value: selectedOptionIds,
    displayValue:
      selectedLabels.length > 0
        ? selectedLabels.join(", ")
        : NO_ANSWER_DISPLAY_VALUE,
  };
}

function buildRadioAnswer(
  field: FormFieldConfig,
  value: FormSubmissionAnswerValue | undefined,
): FormSubmissionAnswer {
  const submittedOptionId = Array.isArray(value) ? value[0] : value;
  const selectedOption =
    typeof submittedOptionId === "string"
      ? field.options.find((option) => option.id === submittedOptionId)
      : null;

  if (typeof submittedOptionId === "string" && !selectedOption) {
    throw invalidState("This form changed. Refresh and try again.");
  }

  if (field.required && !selectedOption) {
    throw invalidState(`Please answer ${getFieldLabel(field)}.`);
  }

  return {
    fieldId: field.id,
    fieldTypeSnapshot: field.type,
    fieldLabelSnapshot: getFieldLabel(field),
    value: selectedOption?.id ?? null,
    displayValue: selectedOption?.label ?? NO_ANSWER_DISPLAY_VALUE,
  };
}

function buildSubmissionAnswers(
  fields: FormFieldConfig[],
  submittedAnswers: SubmittedAnswer[],
) {
  if (submittedAnswers.length > MAX_FORM_FIELDS) {
    throw invalidState(`Forms can submit up to ${MAX_FORM_FIELDS} answers.`);
  }

  validateNoUnknownFields(fields, submittedAnswers);

  const submittedAnswersByFieldId = normalizeSubmittedAnswers(submittedAnswers);

  return fields.map((field) => {
    const value = submittedAnswersByFieldId.get(field.id);

    switch (field.type) {
      case "SimpleInput":
        return buildSimpleInputAnswer(field, value);
      case "Select":
        return buildSelectAnswer(field, value);
      case "Radio":
        return buildRadioAnswer(field, value);
    }
  });
}

function toSubmissionSummary(
  submission: Pick<Doc<"formSubmissions">, "_id" | "updatedAt" | "answers">,
) {
  return {
    id: submission._id,
    updatedAt: submission.updatedAt,
    answers: submission.answers.map((answer) => ({
      fieldId: answer.fieldId,
      fieldTypeSnapshot: answer.fieldTypeSnapshot,
      value: answer.value,
      displayValue: answer.displayValue,
    })),
  };
}

export const getViewerFormSubmission = query({
  args: {
    pageId: v.id("pages"),
    formInstanceId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    const membership = await requireProjectMember(ctx, page.projectId, userId);
    const submission = await ctx.db
      .query("formSubmissions")
      .withIndex("by_page_form_user", (index) =>
        index
          .eq("pageId", page._id)
          .eq("formInstanceId", args.formInstanceId)
          .eq("submittedByUserId", userId),
      )
      .unique();

    return {
      viewerRole: membership.role,
      canSubmit: membership.role === "client",
      submission: submission ? toSubmissionSummary(submission) : null,
    };
  },
});

export const submitForm = mutation({
  args: {
    pageId: v.id("pages"),
    formInstanceId: v.string(),
    answers: v.array(
      v.object({
        fieldId: v.string(),
        value: formAnswerValueValidator,
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireCurrentAuth(ctx);
    const page = await requirePageAccess(ctx, args.pageId, userId);
    const membership = await requireProjectMember(ctx, page.projectId, userId);

    if (membership.role !== "client") {
      throw invalidState("Only clients can submit forms.");
    }

    const document = parsePageDocument(page.contentJson);
    const component = document.components[args.formInstanceId];

    if (!component || component.type !== "Form") {
      throw invalidState("This form is no longer available.");
    }

    const answers = buildSubmissionAnswers(
      component.config.fields,
      args.answers,
    );
    const now = Date.now();
    const submitterNameSnapshot = buildProjectMemberDisplayName(
      user,
      membership,
    );
    const existingSubmission = await ctx.db
      .query("formSubmissions")
      .withIndex("by_page_form_user", (index) =>
        index
          .eq("pageId", page._id)
          .eq("formInstanceId", args.formInstanceId)
          .eq("submittedByUserId", userId),
      )
      .unique();

    if (existingSubmission) {
      await ctx.db.patch(existingSubmission._id, {
        submitterNameSnapshot,
        submitterImageSnapshot: user.image ?? undefined,
        pageTitleSnapshot: page.title,
        answers,
        updatedAt: now,
      });

      return toSubmissionSummary({
        _id: existingSubmission._id,
        updatedAt: now,
        answers,
      });
    }

    const submissionId = await ctx.db.insert("formSubmissions", {
      projectId: page.projectId,
      pageId: page._id,
      formInstanceId: args.formInstanceId,
      submittedByUserId: userId,
      submitterNameSnapshot,
      submitterImageSnapshot: user.image ?? undefined,
      pageTitleSnapshot: page.title,
      answers,
      createdAt: now,
      updatedAt: now,
    });

    return toSubmissionSummary({
      _id: submissionId,
      updatedAt: now,
      answers,
    });
  },
});
