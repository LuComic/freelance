export const PLACEHOLDER_FILES = [
  "Docs",
  "Components",
  "Blocks",
  "Charts",
  "Directory",
  "Create",
  "Accordion",
  "Button",
  "Card",
  "Dialog",
  "Input",
  "Select",
  "Table",
  "Tabs",
  "Toast",
];

export type SearchPerson = {
  name: string;
  subtitle: string;
};

export const PLACEHOLDER_PEOPLE: SearchPerson[] = [
  { name: "Alex Morgan", subtitle: "Product Designer" },
  { name: "Jordan Lee", subtitle: "Frontend Engineer" },
  { name: "Sam Carter", subtitle: "Motion Designer" },
  { name: "Riley Kim", subtitle: "Freelance PM" },
  { name: "Casey Nguyen", subtitle: "Brand Strategist" },
];

export type TemplatePage = {
  title: string;
  description: string;
  components: string[];
};

export type SearchTemplateBase = {
  name: string;
  author: string;
};

export type PageSearchTemplate = SearchTemplateBase & {
  templateType: "page";
  page: TemplatePage;
};

export type ProjectSearchTemplate = SearchTemplateBase & {
  templateType: "project";
  pages: TemplatePage[];
};

export type SearchTemplate = PageSearchTemplate | ProjectSearchTemplate;

export const PLACEHOLDER_TEMPLATES: SearchTemplate[] = [
  {
    templateType: "project",
    name: "Client Kickoff",
    author: "Alex Morgan",
    pages: [
      {
        title: "Requirements",
        description: "Collect goals, scope, and timeline.",
        components: ["Input", "Select", "Textarea"],
      },
      {
        title: "Stakeholders",
        description: "Track key contacts and roles.",
        components: ["Table", "Tag"],
      },
    ],
  },
  {
    templateType: "page",
    name: "Design Handoff",
    author: "Jordan Lee",
    page: {
      title: "Assets",
      description: "Attach and organize final design exports.",
      components: ["Files", "Checklist"],
    },
  },
  {
    templateType: "project",
    name: "Feedback Loop",
    author: "Sam Carter",
    pages: [
      {
        title: "Review Form",
        description: "Gather structured feedback from collaborators.",
        components: ["Rating", "Textarea", "Radio"],
      },
    ],
  },
];
