"use client";
import Link from "next/link";
import { useState } from "react";

const COOKIES: { text: string; link: string; type: string } = {
  text: "Agree with our cookies",
  link: "/legal/cookies",
  type: "cookies",
};

const PRIVACY_AND_TOS: { text: string; link: string; type: string }[] = [
  {
    text: "Agree with Privacy settings",
    link: "/legal/privacy",
    type: "privacy",
  },
  {
    text: "Agree with Terms of Service",
    link: "/legal/terms",
    type: "tos",
  },
];

export const LegalToggles = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (index: number) => {
    const toggleType = (type: string) => {
      setSelected((prev) =>
        prev.includes(type)
          ? prev.filter((selectedType) => selectedType !== type)
          : [...prev, type],
      );
    };

    switch (index) {
      case 0:
        toggleType("privacy");
        break;
      case 1:
        toggleType("tos");
        break;
      case 3:
        toggleType("cookies");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <button
        key={COOKIES.link}
        className={`flex items-center gap-2 justify-start w-full @[40rem]:w-1/2  border px-2 py-1.5 ${selected.includes(COOKIES.type) ? "border-(--vibrant) bg-(--vibrant)/10" : "border-(--gray) bg-(--gray)/10"} rounded-sm`}
        onClick={() => toggleOption(3)}
      >
        <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-sm bg-(--darkest)">
          {selected.includes(COOKIES.type) && (
            <span className="bg-(--vibrant) aspect-square h-full rounded-xs" />
          )}
        </span>
        {COOKIES.text}
        <Link
          href={COOKIES.link}
          className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
        >
          Documentation
        </Link>
      </button>
      {PRIVACY_AND_TOS.map((item, index) => (
        <button
          key={item.link}
          className={`flex items-center gap-2 justify-start w-full @[40rem]:w-1/2  border px-2 py-1.5 ${selected.includes(item.type) ? "border-(--vibrant) bg-(--vibrant)/10" : "border-(--gray) bg-(--gray)/10"} rounded-sm`}
          onClick={() => toggleOption(index)}
        >
          <span className="h-5 flex items-center p-1 justify-center w-auto aspect-square rounded-sm bg-(--darkest)">
            {selected.includes(item.type) && (
              <span className="bg-(--vibrant) aspect-square h-full rounded-xs" />
            )}
          </span>
          {item.text}
          <Link
            href={item.link}
            className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
          >
            Documentation
          </Link>
        </button>
      ))}
    </>
  );
};
