"use client";

import {
  FilePlusCorner,
  LayoutTemplate,
  Pencil,
  Radio,
  Search,
  Share,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useEditMode } from "./EditModeContext";
import { useOptionalPageDocument } from "./PageDocumentContext";
import { usePathname } from "next/navigation";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SaveTemplateModal } from "./SaveTemplateModal";
import { useSearchBar } from "../searchbar/SearchBarContext";

export const TopBar = () => {
  const { isLive, modeLock, setIsEditing, setIsLive } = useEditMode();
  const pageDocument = useOptionalPageDocument();
  const { openTemplateSearch } = useSearchBar();
  const currentMode = isLive ? "live" : "edit";
  const pathname = usePathname();
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const pageTitle = pageDocument?.activePage?.page.title ?? "";
  const [titleDraft, setTitleDraft] = useState("");
  const isHidden =
    pathname.includes("settings") ||
    pathname.includes("analytics") ||
    pathname.includes("terms") ||
    pathname.includes("privacy") ||
    pathname.includes("cookies") ||
    pathname === "/projects" ||
    !pageDocument?.isActivePage ||
    pageDocument?.viewerRole === "client" ||
    modeLock === "live";

  const startTitleEdit = () => {
    setTitleDraft(pageTitle);
    setIsEditingTitle(true);
  };

  const saveTitle = () => {
    if (!pageDocument) {
      return;
    }

    const nextTitle = titleDraft.trim();
    pageDocument.setPageTitle(nextTitle || pageTitle);
    setIsEditingTitle(false);
  };

  const submitTitle = async () => {
    if (!pageDocument) {
      return;
    }

    await pageDocument.commitPageTitle(titleDraft);
    setIsEditingTitle(false);
  };

  const cancelTitleEdit = () => {
    setTitleDraft(pageTitle);
    setIsEditingTitle(false);
  };

  useEffect(() => {
    queueMicrotask(() => {
      setIsDeleteConfirming(false);
    });
  }, [pageDocument?.activePage?.page.id]);

  const handleDeletePage = async () => {
    if (!pageDocument || pageDocument.deleteStatus === "deleting") {
      return;
    }

    if (!isDeleteConfirming) {
      setIsDeleteConfirming(true);
      return;
    }

    await pageDocument.deletePage();
    setIsDeleteConfirming(false);
  };

  return (
    <>
      {isLive ? (
        <div
          className={`mx-auto h-10 px-1.5 ${isHidden ? "hidden" : "flex"} items-center justify-center shadow-md rounded-lg backdrop-blur-md bg-(--dim)/60 border border-(--gray) gap-2 absolute-center w-max`}
        >
          <span className="text-sm md:text-base">Client&apos;s view</span>
          <Select
            value={currentMode}
            onValueChange={(value) => {
              if (value === "edit") {
                setIsEditing(true);
                return;
              }

              setIsLive(true);
            }}
          >
            <SelectTrigger className="w-28 text-sm px-2 h-6.5! bg-(--darkest) border-(--vibrant) text-(--gray-page)">
              <SelectValue placeholder="Mode" className="text-sm" />
            </SelectTrigger>
            <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
              <SelectGroup className="bg-(--darkest)">
                <SelectItem
                  value="edit"
                  className="data-highlighted:bg-(--dim) data-highlighted:text-(--light)! text-sm h-6.5!"
                >
                  <div className="flex items-center gap-2">
                    <Pencil size={14} className="hover:text-(--light)" />
                    Edit
                  </div>
                </SelectItem>
                <SelectItem
                  value="live"
                  className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="hover:text-(--light)" />
                    Live
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div
          className={`@container w-full border-b border-(--gray) ${
            isHidden ? "hidden" : "flex"
          } items-center justify-start gap-2 px-1.5 h-10`}
        >
          <Select
            value={currentMode}
            onValueChange={(value) => {
              if (value === "edit") {
                setIsEditing(true);
                return;
              }

              setIsLive(true);
            }}
          >
            <SelectTrigger
              className={`w-28 text-sm px-2 h-6.5! bg-(--darkest) border-(--vibrant) text-(--gray-page) ${isLive ? "mr-auto" : ""}`}
            >
              <SelectValue placeholder="Mode" className="text-sm" />
            </SelectTrigger>
            <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
              <SelectGroup className="bg-(--darkest)">
                <SelectItem
                  value="edit"
                  className="data-highlighted:bg-(--dim) data-highlighted:text-(--light)! text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Pencil size={14} className="hover:text-(--light)" />
                    Edit
                  </div>
                </SelectItem>
                <SelectItem
                  value="live"
                  className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="hover:text-(--light)" />
                    Live
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {!isLive && (
            <div className="w-px h-2/3 bg-(--gray) hidden @[35rem]:inline" />
          )}
          {!isLive || pageDocument?.saveError ? (
            <div className="mr-auto flex min-w-0 items-center gap-2">
              {!isLive && pageDocument?.saveStatus ? (
                <button
                  onClick={() => void pageDocument.saveDocument()}
                  disabled={
                    pageDocument.saveStatus === "saving" ||
                    !pageDocument.hasUnsavedChanges
                  }
                  className="text-sm gap-1 hidden @[35rem]:flex items-center justify-center p-1 @[48rem]:px-2 @[48rem]:py-0.5 rounded-md border border-(--vibrant) bg-(--vibrant)/20 hover:bg-(--vibrant-hover)/20 disabled:border-(--gray-page) disabled:text-(--gray-page) disabled:bg-transparent disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  {pageDocument.saveStatus === "saving" ? "Saving" : "Save"}
                </button>
              ) : null}
              {pageDocument?.saveError ? (
                <p
                  className="max-w-36 @[48rem]:max-w-96 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-(--declined-border)"
                  title={pageDocument.saveError}
                >
                  {pageDocument.saveError}
                </p>
              ) : null}
            </div>
          ) : null}
          {isEditingTitle ? (
            <input
              type="text"
              id="edit_field"
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submitTitle();
                }
                if (e.key === "Escape") cancelTitleEdit();
              }}
              className="h-8 px-2 rounded-md border border-(--gray-page) bg-(--dim) text-(--light) outline-none"
            />
          ) : (
            <p
              onClick={startTitleEdit}
              className="cursor-text px-2 py-1 rounded-md hover:bg-(--gray)/20 overflow-x-hidden text-nowrap"
            >
              {pageTitle}
            </p>
          )}
          <button
            className="text-sm gap-1 flex items-center justify-center p-1 @[48rem]:px-2 @[48rem]:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20 ml-auto"
            onClick={() => void pageDocument?.createPageAndOpen()}
          >
            <FilePlusCorner size={15} />
            <span className="hidden @[48rem]:inline">New Page</span>
          </button>
          <div className="flex flex-col items-start gap-1">
            <button
              className={`text-sm gap-1 flex items-center justify-center p-1 @[48rem]:px-2 @[48rem]:py-0.5 rounded-md border  disabled:cursor-not-allowed disabled:hover:bg-transparent ${isDeleteConfirming ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20 text-(--light)" : "border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20"}`}
              onClick={() => void handleDeletePage()}
              disabled={pageDocument?.deleteStatus === "deleting"}
            >
              <Trash size={15} />
              <span className="hidden @[48rem]:inline">
                {pageDocument?.deleteStatus === "deleting"
                  ? "Deleting..."
                  : isDeleteConfirming
                    ? "Are you sure?"
                    : "Delete"}
              </span>
            </button>
            {pageDocument?.deleteError ? (
              <p className="text-xs text-(--declined-border)">
                {pageDocument.deleteError}
              </p>
            ) : null}
          </div>
          <Menubar className="h-auto bg-transparent border-none shadow-none p-0">
            <MenubarMenu>
              <MenubarTrigger className="data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--gray-page) data-[state=open]:text-(--gray-page) py-0 text-sm flex items-center justify-center p-1 @[48rem]:px-2 @[48rem]:py-0.5 rounded-md border border-(--gray-page) hover:bg-(--gray)/20 gap-1 text-(--gray-page)">
                <LayoutTemplate size={15} />
                <span className="hidden @[48rem]:inline">Template</span>
              </MenubarTrigger>
              <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
                <MenubarGroup>
                  <MenubarItem
                    className="data-highlighted:bg-(--darkest-hover) data-highlighted:text-(--light)"
                    onSelect={() => openTemplateSearch()}
                  >
                    <button className="flex w-full items-center justify-start gap-2">
                      <Search size={15} />
                      Use template
                    </button>
                  </MenubarItem>
                  <MenubarItem
                    className="data-highlighted:bg-(--darkest-hover) data-highlighted:text-(--light)"
                    onSelect={() => setSaveTemplateOpen(true)}
                  >
                    <div className="flex w-full items-center justify-start gap-2">
                      <Share size={15} />
                      Save template
                    </div>
                  </MenubarItem>
                </MenubarGroup>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <SaveTemplateModal
            open={saveTemplateOpen}
            onOpenChange={setSaveTemplateOpen}
          />
        </div>
      )}
    </>
  );
};
