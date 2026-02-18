"use client";

import { useState } from "react";
import { Feedback } from "@/app/lib/components/page_components/feedback/Feedback";
import { Kanban } from "@/app/lib/components/page_components/progress/Kanban";
import { Radio } from "@/app/lib/components/page_components/form/radio/Radio";
import { Select as FieldSelect } from "@/app/lib/components/page_components/form/select/Select";
import { TextFields } from "@/app/lib/components/page_components/content/text/TextFields";
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
    useState<"kanban" | "feedback" | "radio" | "select" | "text">(
      "kanban",
    );

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
            <SelectItem
              value="radio"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) cursor-pointer"
            >
              Radio
            </SelectItem>
            <SelectItem
              value="select"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) cursor-pointer"
            >
              Select
            </SelectItem>
            <SelectItem
              value="text"
              className="data-highlighted:bg-(--dim) data-highlighted:text-(--light) cursor-pointer"
            >
              Text
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {selectedFeature === "feedback" ? (
        <Feedback
          initialClientLayout={initialClientLayout}
          initialCreatorLayout={initialCreatorLayout}
        />
      ) : selectedFeature === "radio" ? (
        <Radio
          initialClientLayout={initialClientLayout}
          initialCreatorLayout={initialCreatorLayout}
        />
      ) : selectedFeature === "select" ? (
        <FieldSelect
          initialClientLayout={initialClientLayout}
          initialCreatorLayout={initialCreatorLayout}
        />
      ) : selectedFeature === "text" ? (
        <TextFields
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
