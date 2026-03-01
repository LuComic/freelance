"use client";

import {
  Cog,
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
import { SaveTemplateModal } from "./SaveTemplateModal";
import { useSearchBar } from "../searchbar/SearchBarContext";

export const TopBar = () => {
  const { isEditing, isLive, setIsEditing, setIsLive } = useEditMode();
  const pageDocument = useOptionalPageDocument();
  const { openTaggedSearch } = useSearchBar();
  const isConfig = !isEditing && !isLive;
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
    !pageDocument?.isActivePage;

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
    <div
      className={`@container w-full border-b border-(--gray) ${
        isHidden ? "hidden" : "flex"
      } items-center justify-start gap-2 px-1.5 h-10`}
    >
      <button
        onClick={() => setIsEditing(true)}
        className={`text-sm gap-1 flex items-center justify-center p-1 @[64rem]:px-2 @[64rem]:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isEditing
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Pencil size={15} />
        <span className="hidden @[64rem]:inline">Edit</span>
      </button>
      <button
        onClick={() => {
          setIsEditing(false);
          setIsLive(false);
        }}
        className={`text-sm gap-1 flex items-center justify-center p-1 @[64rem]:px-2 @[64rem]:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isConfig
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        }`}
      >
        <Cog size={15} />
        <span className="hidden @[64rem]:inline">Config</span>
      </button>
      <button
        onClick={() => setIsLive(true)}
        className={`text-sm gap-1 flex items-center justify-center p-1 @[64rem]:px-2 @[64rem]:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) ${
          isLive
            ? "bg-(--vibrant)/20 border-(--vibrant) text-(--light)"
            : "hover:bg-(--gray)/20"
        } ${isLive && "mr-auto"}`}
      >
        <Radio size={15} />
        <span className="hidden @[64rem]:inline">Live</span>
      </button>
      {!isLive && <div className="w-px h-2/3 bg-(--gray)" />}
      {!isLive && pageDocument?.saveStatus ? (
        <button
          onClick={() => void pageDocument.saveDocument()}
          disabled={
            pageDocument.saveStatus === "saving" ||
            !pageDocument.hasUnsavedChanges
          }
          className="text-sm gap-1 flex items-center justify-center p-1 @[64rem]:px-2 @[64rem]:py-0.5 rounded-md border border-(--vibrant) bg-(--vibrant)/20 hover:bg-(--vibrant-hover)/20 disabled:border-(--gray-page) disabled:text-(--gray-page) disabled:bg-transparent disabled:hover:bg-transparent disabled:cursor-not-allowed mr-auto"
        >
          {pageDocument.saveStatus === "saving" ? "Saving" : "Save"}
        </button>
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
          className="h-8 px-2 rounded-md border border-(--gray-page) bg-(--darkest) text-(--light) outline-none"
        />
      ) : (
        <p
          onClick={startTitleEdit}
          className="cursor-text px-2 py-1 rounded-md hover:bg-(--gray)/20"
        >
          {pageTitle}
        </p>
      )}
      <button
        className="text-sm gap-1 flex items-center justify-center p-1 @[64rem]:px-2 @[64rem]:py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20 ml-auto"
        onClick={() => void pageDocument?.createPageAndOpen()}
      >
        <FilePlusCorner size={15} />
        <span className="hidden @[64rem]:inline">New Page</span>
      </button>
      <div className="flex flex-col items-start gap-1">
        <button
          className={`text-sm gap-1 flex items-center justify-center p-1 @[64rem]:px-2 @[64rem]:py-0.5 rounded-md border  disabled:cursor-not-allowed disabled:hover:bg-transparent ${isDeleteConfirming ? "border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20 text-(--light)" : "border-(--gray-page) text-(--gray-page) hover:bg-(--gray)/20"}`}
          onClick={() => void handleDeletePage()}
          disabled={pageDocument?.deleteStatus === "deleting"}
        >
          <Trash size={15} />
          <span className="hidden @[64rem]:inline">
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
          <MenubarTrigger className="data-highlighted:bg-transparent data-[state=open]:bg-transparent data-highlighted:text-(--gray-page) data-[state=open]:text-(--gray-page) py-0 text-sm flex items-center justify-center p-1 @[64rem]:px-2 @[64rem]:py-0.5 rounded-md border border-(--gray-page) hover:bg-(--gray)/20 gap-1 text-(--gray-page)">
            <LayoutTemplate size={15} />
            <span className="hidden @[64rem]:inline">Template</span>
          </MenubarTrigger>
          <MenubarContent className="bg-(--quite-dark) border border-(--gray) text-(--light) transition-none!">
            <MenubarGroup>
              <MenubarItem
                className="data-highlighted:bg-(--darkest-hover) data-highlighted:text-(--light)"
                onSelect={() => openTaggedSearch("template")}
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
  );
};
