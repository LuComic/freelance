"use client";

import { useState } from "react";

const RADIO_OPTIONS = ["This week", "Next week"];
const SELECT_OPTIONS = ["Design", "Development", "Copywriting"];

export const FormPreview = () => {
  const [timeline, setTimeline] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleDeliverable = (deliverable: string) => {
    setErrorMessage(null);
    setDeliverables((currentDeliverables) =>
      currentDeliverables.includes(deliverable)
        ? currentDeliverables.filter((current) => current !== deliverable)
        : [...currentDeliverables, deliverable],
    );
  };

  const submitForm = () => {
    if (deliverables.length === 0) {
      setErrorMessage("Please answer Deliverables.");
      return;
    }

    setTimeline("");
    setDeliverables([]);
    setErrorMessage(null);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="border-(--gray) border-y py-2 w-full flex flex-col gap-4">
        <div className="w-full flex flex-col gap-2">
          <p className="@[40rem]:text-xl text-lg font-medium">Timeline</p>
          <p className="text-(--gray-page)">Choose one preferred pace.</p>
          <div className="w-full flex flex-col gap-2">
            {RADIO_OPTIONS.map((option) => {
              const selected = timeline === option;

              return (
                <button
                  key={option}
                  type="button"
                  className="flex items-center gap-2 justify-start w-full"
                  onClick={() => {
                    setTimeline(option);
                    setErrorMessage(null);
                  }}
                >
                  <span
                    className={`h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-full bg-(--darkest) ${
                      selected
                        ? "border-(--vibrant) bg-(--vibrant)/10"
                        : "border-(--gray) bg-(--gray)/10"
                    } border`}
                  >
                    {selected ? (
                      <span className="bg-(--vibrant) aspect-square h-full rounded-full" />
                    ) : null}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <p className="@[40rem]:text-xl text-lg font-medium">
            Deliverables <span className="text-(--declined-border)"> *</span>
          </p>
          <p className="text-(--gray-page)">Pick everything you need.</p>
          <div className="w-full flex flex-col gap-2">
            {SELECT_OPTIONS.map((option) => {
              const selected = deliverables.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  className={`flex items-center gap-2 justify-start w-full @[40rem]:w-1/2  border px-2 py-1.5 ${
                    selected
                      ? "border-(--vibrant) bg-(--vibrant)/10"
                      : "border-(--gray) bg-(--gray)/10"
                  } rounded-sm`}
                  onClick={() => toggleDeliverable(option)}
                >
                  <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-sm bg-(--darkest)">
                    {selected ? (
                      <span className="bg-(--vibrant) aspect-square h-full rounded-xs" />
                    ) : null}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-max rounded-md py-1 px-2 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-60"
        onClick={submitForm}
      >
        Submit form
      </button>

      {errorMessage ? (
        <p className="text-(--declined-border)">{errorMessage}</p>
      ) : null}
    </div>
  );
};
