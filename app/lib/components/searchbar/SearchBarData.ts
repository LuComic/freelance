import type { ConnectionPerson } from "../connections/types";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  PageTemplateBlueprint,
  ProjectTemplateBlueprint,
} from "@/lib/templateBlueprint";

export type SearchPerson = ConnectionPerson;

export type TemplatePage = {
  title: string;
  description: string;
  components: string[];
};

export type SearchTemplateType = "page" | "project";

export type SearchTemplateBase = {
  id: Id<"templates">;
  authorUserId: Id<"users">;
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
  blueprint: PageTemplateBlueprint;
  page: TemplatePage;
};

export type ProjectSearchTemplate = SearchTemplateSummary & {
  templateType: "project";
  blueprint: ProjectTemplateBlueprint;
  pages: TemplatePage[];
};

export type SearchTemplate = PageSearchTemplate | ProjectSearchTemplate;
