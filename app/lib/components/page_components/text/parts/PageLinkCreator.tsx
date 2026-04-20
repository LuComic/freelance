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
import {
  getPageLinkFallbackText,
  shouldSyncPageLinkText,
  type ProjectPageOption,
} from "./PageLink.shared";
import { MAX_SHORT_TITLE_LENGTH } from "@/lib/inputLimits";

type PageLinkCreatorProps = {
  config: PageComponentInstanceByType<"PageLink">["config"];
  instanceId: string;
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
  instanceId,
  pages,
  isLoadingPages,
  onChangeConfig,
}: PageLinkCreatorProps) => {
  const selectedTargetPage =
    pages.find((page) => page.id === config.targetPageId) ?? null;
  const selectedTargetPageId = selectedTargetPage?.id ?? "";
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
        maxLength={MAX_SHORT_TITLE_LENGTH}
        className="w-full rounded-md bg-(--dim) px-2 py-1.5 outline-none"
        onBlur={() => {
          if (config.text.trim()) {
            return;
          }

          onChangeConfig((currentConfig) => ({
            ...currentConfig,
            text: getPageLinkFallbackText(selectedTargetPage?.title),
          }));
        }}
      />

      <Select
        key={`${instanceId}:${selectedTargetPageId || "empty"}`}
        value={selectedTargetPageId}
        onValueChange={(value) =>
          onChangeConfig((currentConfig) => {
            const currentTargetPage =
              pages.find((page) => page.id === currentConfig.targetPageId) ??
              null;
            const nextTargetPage =
              pages.find((page) => page.id === value) ?? null;

            return {
              ...currentConfig,
              targetPageId: value,
              text: shouldSyncPageLinkText(
                currentConfig.text,
                currentTargetPage?.title,
              )
                ? getPageLinkFallbackText(nextTargetPage?.title)
                : currentConfig.text,
            };
          })
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
