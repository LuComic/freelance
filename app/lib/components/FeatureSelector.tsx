"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FeatureSelectorProps = {
  initialClientLayout?: "grid" | "list";
  initialCreatorLayout?: "grid" | "list";
};

export const FeatureSelector = ({
  initialClientLayout,
  initialCreatorLayout,
}: FeatureSelectorProps) => {
  const [selectedFeature, setSelectedFeature] = useState<
    "kanban" | "feedback" | "radio" | "select" | "text"
  >("kanban");

  return (
    <div className="w-full flex flex-col gap-2">
      <Select
        value={selectedFeature}
        onValueChange={(value) =>
          setSelectedFeature(
            value as "kanban" | "feedback" | "radio" | "select" | "text",
          )
        }
      >
        <SelectTrigger className="w-full md:w-52 bg-(--darkest) border-(--gray-page) ">
          <SelectValue placeholder="Pick a feature" />
        </SelectTrigger>
        <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
          <SelectGroup className="bg-(--darkest)">
            <SelectItem
              value="kanban"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) "
            >
              Kanban
            </SelectItem>
            <SelectItem
              value="feedback"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) "
            >
              Feedback
            </SelectItem>
            <SelectItem
              value="radio"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) "
            >
              Radio
            </SelectItem>
            <SelectItem
              value="select"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) "
            >
              Select
            </SelectItem>
            <SelectItem
              value="text"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) "
            >
              Text
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="rounded-md border border-(--gray) bg-(--darkest) p-4 text-sm text-(--gray-page)">
        <p className="font-medium text-(--light)">
          {selectedFeature.charAt(0).toUpperCase() + selectedFeature.slice(1)} preview
        </p>
        <p className="mt-1">
          Interactive feature previews now live inside persisted page documents.
        </p>
        <p className="mt-2">
          Client layout: {initialClientLayout ?? "default"} · Creator layout:{" "}
          {initialCreatorLayout ?? "default"}
        </p>
      </div>
    </div>
  );
};
