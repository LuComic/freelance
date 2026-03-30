"use client";

import type { PageComponentInstanceByType } from "@/lib/pageDocument";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectPageOption } from "./PageLink";

type PageLinkCreatorProps = {
  config: PageComponentInstanceByType<"PageLink">["config"];
  pages: ProjectPageOption[];
  isLoadingPages: boolean;
  onChangeConfig: (
    updater: (
      config: PageComponentInstanceByType<"PageLink">["config"],
    ) => PageComponentInstanceByType<"PageLink">["config"],
  ) => void;
};

export const PageLinkCreator = ({
  config,
  pages,
  isLoadingPages,
  onChangeConfig,
}: PageLinkCreatorProps) => {
  const selectedTargetPageId = pages.some(
    (page) => page.id === config.targetPageId,
  )
    ? (config.targetPageId ?? undefined)
    : undefined;
  const selectPlaceholder = isLoadingPages
    ? "Loading pages..."
    : pages.length === 0
      ? "No pages available"
      : "Select a page";

  return (
    <>
      <p className="@[40rem]:text-xl text-lg font-medium mt-2">Page link</p>
      <p className="text-(--gray-page)">
        Create special text that can link to other pages in your project
      </p>
      <input
        type="text"
        value={config.text}
        onChange={(event) =>
          onChangeConfig((currentConfig) => ({
            ...currentConfig,
            text: event.target.value,
          }))
        }
        placeholder="Link text..."
        className="w-full rounded-md bg-(--dim) px-2 py-1.5 outline-none"
      />

      <Select
        value={selectedTargetPageId}
        onValueChange={(value) =>
          onChangeConfig((currentConfig) => ({
            ...currentConfig,
            targetPageId: value,
          }))
        }
        disabled={isLoadingPages || pages.length === 0}
      >
        <SelectTrigger className="w-full @[40rem]:w-52 bg-(--dim) border-(--gray-page)">
          <SelectValue placeholder={selectPlaceholder} />
        </SelectTrigger>
        <SelectContent className="bg-(--dim) border-none text-(--gray-page)">
          <SelectGroup className="bg-(--dim)">
            {pages.map((page) => (
              <SelectItem
                key={page.id}
                value={page.id}
                className="data-highlighted:bg-(--darkest) data-highlighted:text-(--light)"
              >
                {page.title}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};
