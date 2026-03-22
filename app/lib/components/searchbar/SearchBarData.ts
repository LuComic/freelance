import type { ConnectionPerson } from "../connections/types";
import type { Id } from "@/convex/_generated/dataModel";
import type { PageComponentType } from "@/lib/pageDocument";
import type {
  PageTemplateBlueprintV1,
  ProjectTemplateBlueprintV1,
} from "@/lib/templateBlueprint";

export type SearchPerson = ConnectionPerson;

export type TemplatePage = {
  title: string;
  description: string;
  components: PageComponentType[];
};

export type SearchTemplateType = "page" | "project";

export type SearchTemplateBase = {
  id: Id<"templates">;
  name: string;
  author: string;
  description: string | null;
  updatedAt: number;
};

export type SearchTemplateSummary = SearchTemplateBase & {
  templateType: SearchTemplateType;
};

export type PageSearchTemplate = SearchTemplateSummary & {
  templateType: "page";
  blueprint: PageTemplateBlueprintV1;
  page: TemplatePage;
};

export type ProjectSearchTemplate = SearchTemplateSummary & {
  templateType: "project";
  blueprint: ProjectTemplateBlueprintV1;
  pages: TemplatePage[];
};

export type SearchTemplate = PageSearchTemplate | ProjectSearchTemplate;
