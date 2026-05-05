import type { Metadata } from "next";
import ProjectsPageClient from "./ProjectsPageClient";

export const metadata: Metadata = {
  title: "Pageboard | Projects",
  description:
    "View, create, and join Pageboard projects for client collaboration.",
};

export default function Page() {
  return <ProjectsPageClient />;
}
