"use client";

import Link from "next/link";

const LEGAL_OPTIONS = [
  {
    text: "Agree with our cookies",
    link: "/legal/cookies",
    type: "cookies",
  },
  {
    text: "Agree with Privacy Policy",
    link: "/legal/privacy",
    type: "privacy",
  },
  {
    text: "Agree with Terms of Service",
    link: "/legal/terms",
    type: "tos",
  },
] as const;

type LegalToggleType = (typeof LEGAL_OPTIONS)[number]["type"];

type LegalAcceptanceState = Record<LegalToggleType, boolean>;

export const DEFAULT_LEGAL_ACCEPTANCE_STATE: LegalAcceptanceState = {
  cookies: false,
  privacy: false,
  tos: false,
};

type LegalTogglesProps = {
  value: LegalAcceptanceState;
  onChange: (value: LegalAcceptanceState) => void;
};

export const LegalToggles = ({ value, onChange }: LegalTogglesProps) => {
  const toggleOption = (type: LegalToggleType) => {
    onChange({
      ...value,
      [type]: !value[type],
    });
  };

  return (
    <>
      {LEGAL_OPTIONS.map((item) => (
        <button
          type="button"
          key={item.link}
          aria-pressed={value[item.type]}
          className={`flex items-center gap-2 justify-start w-full @[40rem]:w-1/2 border px-2 py-1.5 ${
            value[item.type]
              ? "border-(--vibrant) bg-(--vibrant)/10"
              : "border-(--gray) bg-(--gray)/10"
          } rounded-sm`}
          onClick={() => toggleOption(item.type)}
        >
          <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-sm bg-(--darkest)">
            {value[item.type] && (
              <span className="bg-(--vibrant) aspect-square h-full rounded-xs" />
            )}
          </span>
          {item.text}
          <Link
            href={item.link}
            onClick={(event) => event.stopPropagation()}
            className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
            target="_blank"
          >
            Documentation
          </Link>
        </button>
      ))}
    </>
  );
};
