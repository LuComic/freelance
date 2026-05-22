"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { PageComponentInstanceByType } from "@/lib/pageDocument";
import { usePageDocument } from "@/app/lib/components/project/PageDocumentContext";
import { useQuery } from "convex/react";

type ImageConfig = PageComponentInstanceByType<"Image">["config"];

export const ImageClient = ({ config }: { config: ImageConfig }) => {
  const { activePage } = usePageDocument();
  const url = useQuery(
    api.pages.images.getPageImageUrl,
    config.storageId
      ? {
          pageId: activePage.page.id as Id<"pages">,
          storageId: config.storageId as Id<"_storage">,
        }
      : "skip",
  );

  if (!config.storageId) {
    return (
      <span className="text-(--gray-page)">
        No image selected. Instead of writing /image, paste or drop the image
        into the editor.
      </span>
    );
  }

  if (!url) {
    return <span className="text-(--gray-page)">Loading image...</span>;
  }

  return (
    <img
      src={url}
      alt={config.altText}
      style={{
        width: config.widthPx ? `${config.widthPx}px` : "100%",
        maxWidth: "100%",
        height: config.heightPx ? `${config.heightPx}px` : "auto",
      }}
      className="rounded-md"
    />
  );
};
