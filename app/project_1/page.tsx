import { PageLink } from "../lib/components/project/PageLink";

export default function Page() {
  return (
    <>
      <h1 className="md:text-3xl text-xl font-medium">
        Project 1 Landing Page
      </h1>
      <p className="text-(--gray-page)">
        This is my first project! This is not made using this site, but is a
        hardcoded project.
      </p>
      <h2 className="md:text-xl text-lg font-medium">## Check out these:</h2>
      <PageLink newPage="Preferences" />
    </>
  );
}
