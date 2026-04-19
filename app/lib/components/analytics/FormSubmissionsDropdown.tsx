"use client";

import type { AnalyticsFormsPageItem } from "@/app/lib/components/analytics/types";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

function formatSubmittedAt(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export const FormSubmissionsDropdown = ({
  item,
  index,
}: {
  item: AnalyticsFormsPageItem;
  index: number;
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div
      className={`${index % 2 !== 0 && "bg-(--gray)/10"} w-full p-2 flex flex-col gap-2`}
    >
      <button
        type="button"
        className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ChevronRight size={20} className={isOpen ? "rotate-90" : "rotate-0"} />
        {item.page}
      </button>
      {isOpen ? (
        <div className="pl-7 flex flex-col gap-4 pb-2">
          {item.forms.map((form) => (
            <div key={form.instanceId} className="w-full flex flex-col gap-2">
              {form.submissions.length > 0 ? (
                form.submissions.map((submission, submissionIndex) => (
                  <div
                    key={submission.id}
                    className={`w-full border-(--gray) py-2 flex flex-col gap-2 ${
                      submissionIndex === 0 ? "border-y" : "border-b"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium">{submission.clientName}</p>
                      <p className="text-(--gray-page) text-sm">
                        {formatSubmittedAt(submission.submittedAt)}
                      </p>
                    </div>
                    {submission.answers.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {submission.answers.map((answer, answerIndex) => (
                          <div
                            key={`${submission.id}-${answer.fieldId}`}
                            className="w-full rounded-md border border-(--gray) px-2 py-1"
                          >
                            <span className="text-(--gray-page) mr-2">
                              {answer.fieldLabel}
                            </span>
                            {answer.displayValue}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-(--gray-page)">
                        No answers submitted.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-(--gray-page)">No submissions yet.</p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
