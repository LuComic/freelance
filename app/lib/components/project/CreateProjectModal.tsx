"use client";

import { api } from "@/convex/_generated/api";
import { currentEntitlementsQuery } from "@/lib/convexFunctionReferences";
import { ChevronRight, Plus, Search, Trash } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProjectPagePath } from "./paths";
import type { SearchPerson, SearchTemplate } from "../searchbar/SearchBarData";
import { useSearchBar } from "../searchbar/SearchBarContext";

type CreateProjectModalProps = {
  ui?: "sidebar" | "projects";
  redirectWhenBlocked?: string;
};

export const CreateProjectModal = ({
  ui = "sidebar",
  redirectWhenBlocked,
}: CreateProjectModalProps) => {
  const router = useRouter();
  const {
    isOpen: isSearchOpen,
    openTaggedSearch,
    openTemplateSearch,
  } = useSearchBar();
  const createProject = useMutation(api.projects.mutations.createProject);
  const entitlements = useQuery(currentEntitlementsQuery, {});
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateSectionOpen, setTemplateSectionOpen] = useState(false);
  const [peopleSectionOpen, setPeopleSectionOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<SearchTemplate | null>(null);
  const [pageDropdowns, setPageDropdowns] = useState<boolean[]>([]);
  const [clients, setClients] = useState<SearchPerson[]>([]);
  const [coCreators, setCoCreators] = useState<SearchPerson[]>([]);
  const selectedProjectTemplate =
    selectedTemplate?.templateType === "project" ? selectedTemplate : null;
  const canCreateOwnedProjects = entitlements?.canCreateOwnedProjects === true;
  const createProjectMessage =
    entitlements?.createProjectMessage ?? "Loading plan access...";

  const getPersonLabel = (person: SearchPerson) => person.name;

  const addPersonToRole =
    (role: "client" | "coCreator") => (person: SearchPerson) => {
      if (role === "client") {
        setClients((prev) => [
          person,
          ...prev.filter((value) => value.userId !== person.userId),
        ]);
        setCoCreators((prev) =>
          prev.filter((value) => value.userId !== person.userId),
        );
        return;
      }

      setCoCreators((prev) => [
        person,
        ...prev.filter((value) => value.userId !== person.userId),
      ]);
      setClients((prev) =>
        prev.filter((value) => value.userId !== person.userId),
      );
    };

  const closeModal = () => {
    setOpen(false);
    setError(null);
    setSelectedTemplate(null);
    setPageDropdowns([]);
  };

  useEffect(() => {
    setPageDropdowns(selectedProjectTemplate?.pages.map(() => false) ?? []);
  }, [selectedProjectTemplate]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSearchOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isSearchOpen, open]);

  const submit = async () => {
    if (!projectName.trim() || isSubmitting || !canCreateOwnedProjects) {
      setError(createProjectMessage);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const members = [
        ...clients.map((client) => ({
          userId: client.userId,
          role: "client" as const,
        })),
        ...coCreators.map((coCreator) => ({
          userId: coCreator.userId,
          role: "coCreator" as const,
        })),
      ];
      const result = await createProject({
        name: projectName,
        description: projectDescription || undefined,
        template: selectedProjectTemplate
          ? {
              templateId: selectedProjectTemplate.id,
              expectedUpdatedAt: selectedProjectTemplate.updatedAt,
            }
          : undefined,
        members: members.length > 0 ? members : undefined,
      });
      closeModal();
      setProjectName("");
      setProjectDescription("");
      setClients([]);
      setCoCreators([]);
      router.push(getProjectPagePath(result.projectId, result.initialPageId));
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Could not create project.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openButtonProps = {
    type: "button" as const,
    disabled: !canCreateOwnedProjects && !redirectWhenBlocked,
    title: !canCreateOwnedProjects ? createProjectMessage : undefined,
    onClick: () => {
      if (!canCreateOwnedProjects) {
        if (redirectWhenBlocked) {
          router.push(redirectWhenBlocked);
        }
        return;
      }

      setOpen(true);
    },
  };

  return (
    <>
      {ui === "projects" ? (
        <button
          {...openButtonProps}
          className="rounded-md bg-(--vibrant) px-2 py-1 hover:bg-(--vibrant-hover)"
        >
          Create project
        </button>
      ) : (
        <button
          {...openButtonProps}
          className={`p-1 rounded-lg hover:bg-(--quite-dark) w-full ${
            open ? "bg-(--quite-dark) text-(--vibrant)" : ""
          }`}
        >
          <Plus size={20} className="mx-auto" />
        </button>
      )}

      {open ? (
        <div
          className="fixed px-2 inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-h-[85vh] h-auto flex flex-col items-start justify-start gap-3 p-3 md:max-w-3xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-full flex flex-col gap-1">
              <p className="md:text-3xl text-xl font-medium">Create Project</p>
              <p className="text-(--gray-page)">
                Start a new project and jump straight into the first page.
              </p>
            </div>

            <div className="w-full border-y border-(--gray) py-3 flex flex-col gap-2">
              <p className="text-(--gray-page)">Project name</p>
              <input
                type="text"
                className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                placeholder="Project name..."
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void submit();
                  }
                }}
              />

              <p className="text-(--gray-page)">Project description</p>
              <textarea
                rows={3}
                className="rounded-md bg-(--dim) px-2 py-1.5 outline-none resize-none"
                placeholder="Project description..."
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
              />
            </div>

            <div className="w-full flex flex-col">
              <div className="w-full p-2 flex flex-col gap-2">
                <button
                  type="button"
                  className="flex font-medium md:text-lg text-base items-center justify-start gap-2"
                  onClick={() => setTemplateSectionOpen((prev) => !prev)}
                >
                  <ChevronRight
                    size={20}
                    className={templateSectionOpen ? "rotate-90" : "rotate-0"}
                  />
                  Template
                </button>

                {templateSectionOpen ? (
                  <div className="pl-7 flex flex-col gap-2 pb-2">
                    <p className="text-(--gray-page)">Search template</p>
                    <div className="w-full flex items-center gap-2">
                      <button
                        type="button"
                        className="w-max gap-2 rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover) flex items-center justify-center"
                        onClick={() =>
                          openTemplateSearch({
                            types: ["project"],
                            selectHandler: (template) =>
                              setSelectedTemplate(template),
                          })
                        }
                      >
                        <Search size={16} />
                        Search
                      </button>
                    </div>

                    {selectedProjectTemplate ? (
                      <>
                        <div className="flex flex-wrap items-center gap-1.5 md:text-lg text-base">
                          <p className="font-medium">
                            {selectedProjectTemplate.name}
                          </p>
                          <span className="text-(--gray-page)">
                            by {selectedProjectTemplate.author}
                          </span>
                        </div>
                        <p className="text-(--gray-page)">
                          Creates {selectedProjectTemplate.pages.length} pages
                        </p>

                        <div className="w-full flex flex-col gap-2">
                          {selectedProjectTemplate.pages.map(
                            (page, pageIndex) => (
                              <div
                                key={`${page.title}-${pageIndex}`}
                                className="w-full flex flex-col gap-2"
                              >
                                <button
                                  type="button"
                                  className="rounded-lg p-1 gap-2 hover:bg-(--darkest-hover) w-full text-(--gray) flex items-center justify-start"
                                  onClick={() =>
                                    setPageDropdowns((prev) =>
                                      prev.map((value, index) =>
                                        index === pageIndex ? !value : value,
                                      ),
                                    )
                                  }
                                >
                                  <ChevronRight
                                    size={18}
                                    className={
                                      pageDropdowns[pageIndex]
                                        ? "rotate-90"
                                        : ""
                                    }
                                  />
                                  <span className="w-full text-left">
                                    {page.title}
                                  </span>
                                </button>

                                {pageDropdowns[pageIndex] ? (
                                  <div className="pl-8 flex flex-col gap-2">
                                    {page.description ? (
                                      <p className="text-(--gray-page)">
                                        {page.description}
                                      </p>
                                    ) : null}
                                    <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                                      {page.components.map((componentName) => (
                                        <div
                                          key={`${page.title}-${componentName}`}
                                          className="px-2 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page)"
                                        >
                                          {componentName}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            ),
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-(--gray-page)">
                        No template selected.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="bg-(--gray)/10 w-full p-2 flex flex-col gap-2">
                <button
                  type="button"
                  className="flex font-medium md:text-lg text-base items-center justify-start gap-2"
                  onClick={() => setPeopleSectionOpen((prev) => !prev)}
                >
                  <ChevronRight
                    size={20}
                    className={peopleSectionOpen ? "rotate-90" : "rotate-0"}
                  />
                  Co-creators and clients
                </button>

                {peopleSectionOpen ? (
                  <div className="pl-7 flex flex-col gap-2 pb-2">
                    <p className="text-(--gray-page)">
                      Invite collaborators while the project is being created.
                    </p>
                    <p className="text-(--gray-page)">Current clients</p>
                    <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                      {clients.map((client) => (
                        <div
                          key={client.userId}
                          className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                        >
                          {getPersonLabel(client)}
                          <button
                            type="button"
                            className="hover:bg-(--gray)/20 p-1 rounded-sm"
                            onClick={() =>
                              setClients((prev) =>
                                prev.filter(
                                  (value) => value.userId !== client.userId,
                                ),
                              )
                            }
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                      onClick={() =>
                        openTaggedSearch(
                          "people",
                          {
                            role: "client",
                            expandInviteSection: false,
                          },
                          addPersonToRole("client"),
                        )
                      }
                    >
                      Manage clients
                    </button>

                    <div className="w-full h-px bg-(--gray) mt-3" />

                    <p className="text-(--gray-page)">Current co-creators</p>
                    <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                      {coCreators.map((coCreator) => (
                        <div
                          key={coCreator.userId}
                          className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                        >
                          {getPersonLabel(coCreator)}
                          <button
                            type="button"
                            className="hover:bg-(--gray)/20 p-1 rounded-sm"
                            onClick={() =>
                              setCoCreators((prev) =>
                                prev.filter(
                                  (value) => value.userId !== coCreator.userId,
                                ),
                              )
                            }
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                      onClick={() =>
                        openTaggedSearch(
                          "people",
                          {
                            role: "coCreator",
                            expandInviteSection: false,
                          },
                          addPersonToRole("coCreator"),
                        )
                      }
                    >
                      Manage co-creators
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {error ? (
              <p className="text-sm text-(--declined-border)">{error}</p>
            ) : null}

            <div className="w-full flex items-center gap-1">
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20 disabled:opacity-60 disabled:hover:bg-(--vibrant)/10"
                onClick={() => void submit()}
                disabled={!projectName.trim() || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
