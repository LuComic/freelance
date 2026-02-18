"use client";

import { useState } from "react";
import { Feedback } from "@/app/lib/components/page_components/feedback/Feedback";
import { Kanban } from "@/app/lib/components/page_components/progress/Kanban";
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
  const [selectedFeature, setSelectedFeature] =
    useState<"kanban" | "feedback">("kanban");

  return (
    <div className="w-full flex flex-col gap-2">
      <Select
        value={selectedFeature}
        onValueChange={(value) =>
          setSelectedFeature(value as "kanban" | "feedback")
        }
      >
        <SelectTrigger className="w-full md:w-52 bg-(--darkest) border-(--gray-page) cursor-pointer">
          <SelectValue placeholder="Pick a feature" />
        </SelectTrigger>
        <SelectContent className="bg-(--darkest) border-none text-(--gray-page)">
          <SelectGroup className="bg-(--darkest)">
            <SelectItem
              value="kanban"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) cursor-pointer"
            >
              Kanban
            </SelectItem>
            <SelectItem
              value="feedback"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) cursor-pointer"
            >
              Feedback
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {selectedFeature === "feedback" ? (
        <Feedback
          initialClientLayout={initialClientLayout}
          initialCreatorLayout={initialCreatorLayout}
        />
      ) : (
        <Kanban
          initialClientLayout={initialClientLayout}
          initialCreatorLayout={initialCreatorLayout}
        />
      )}
    </div>
  );
};
