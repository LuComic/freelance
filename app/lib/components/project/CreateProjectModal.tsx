"use client";

import { ChevronRight, Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";

const TEMPLATE = {
  name: "website freelance",
  author: "ainurakk",
  pages: [
    {
      title: "Preferences",
      description: "Get the basic client's preferences and info",
      components: ["Select", "Select", "Radio"],
    },
    {
      title: "Suggestions",
      description: "Collect client feedback and get feature suggestions",
      components: ["Feedback"],
    },
  ],
};

export const CreateProjectModal = () => {
  const [open, setOpen] = useState(false);
  const [templateSectionOpen, setTemplateSectionOpen] = useState(false);
  const [peopleSectionOpen, setPeopleSectionOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("website freelance");
  const [projectName, setProjectName] = useState("Freelance Website Redesign");
  const [projectDescription, setProjectDescription] = useState(
    "Website project for collecting preferences and feedback from the client.",
  );
  const [pageDropdowns, setPageDropdowns] = useState<boolean[]>(
    TEMPLATE.pages.map(() => false),
  );

  const [clients, setClients] = useState<string[]>([
    "alice@client.co",
    "brand-team@client.co",
  ]);
  const [coCreators, setCoCreators] = useState<string[]>([
    "marco@studio.co",
    "sara@studio.co",
  ]);
  const [newClient, setNewClient] = useState("");
  const [newCoCreator, setNewCoCreator] = useState("");

  const closeModal = () => setOpen(false);

  const templateFound =
    templateSearch.trim() === "" ||
    TEMPLATE.name.includes(templateSearch.trim().toLowerCase()) ||
    TEMPLATE.author.includes(templateSearch.trim().toLowerCase());

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`p-1 rounded-lg hover:bg-(--quite-dark) w-full ${open ? "bg-(--quite-dark) text-(--vibrant)" : ""}`}
        onClick={() => setOpen(true)}
      >
        <Plus size={20} className="mx-auto" />
      </button>

      {open ? (
        <div
          className="fixed px-2 inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-h-[85vh] h-auto flex flex-col items-start justify-start gap-2 p-3 md:max-w-3xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="md:text-3xl text-xl font-medium">
                  Create Project
                </p>
                <p className="text-(--gray-page)">
                  Pick a template and set the first collaborators.
                </p>
              </div>
            </div>

            <div className="w-full border-y border-(--gray) py-3 flex flex-col gap-2">
              <p className="text-(--gray-page)">Project name</p>
              <input
                type="text"
                className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                placeholder="Project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />

              <p className="text-(--gray-page)">Project description</p>
              <textarea
                rows={3}
                className="rounded-md bg-(--dim) px-2 py-1.5 outline-none resize-none"
                placeholder="Project description..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
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
                    className={`${templateSectionOpen ? "rotate-90" : "rotate-0"}`}
                  />
                  Template
                </button>

                {templateSectionOpen ? (
                  <div className="pl-7 flex flex-col gap-2 pb-2">
                    <p className="text-(--gray-page)">Search template</p>
                    <div className="w-full flex items-center gap-2">
                      <input
                        type="text"
                        className="rounded-md bg-(--dim) px-2 py-1.5 outline-none w-full"
                        placeholder="Search"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                      />
                      <button
                        type="button"
                        className="rounded-md border border-(--gray) text-(--gray) p-2 hover:bg-(--gray)/20"
                      >
                        <Search size={18} />
                      </button>
                    </div>

                    {templateFound ? (
                      <>
                        <div className="flex flex-wrap items-center gap-1 md:text-lg text-base">
                          <p className="font-medium">{TEMPLATE.name}</p>
                          <span className="text-(--gray-page)">
                            by {TEMPLATE.author}
                          </span>
                        </div>
                        <p className="text-(--gray-page)">
                          Creates {TEMPLATE.pages.length} pages
                        </p>

                        <div className="w-full flex flex-col gap-1">
                          {TEMPLATE.pages.map((page, pageIndex) => (
                            <div
                              key={page.title}
                              className="w-full flex flex-col"
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
                                  className={`${pageDropdowns[pageIndex] ? "rotate-90" : ""}`}
                                />
                                <span className="w-full text-left">
                                  {page.title}
                                </span>
                              </button>

                              {pageDropdowns[pageIndex] ? (
                                <div className="pl-8 flex flex-col gap-2 pt-1">
                                  <p className="text-(--gray-page)">
                                    {page.description}
                                  </p>
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
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-(--gray-page)">
                        No template found for &quot;{templateSearch}&quot;.
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
                    className={`${peopleSectionOpen ? "rotate-90" : "rotate-0"}`}
                  />
                  Co-creators and clients
                </button>

                {peopleSectionOpen ? (
                  <div className="pl-7 flex flex-col gap-2 pb-2">
                    <p className="text-(--gray-page)">
                      These can be edited later in project settings.
                    </p>
                    <p className="text-(--gray-page)">Current clients</p>
                    <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                      {clients.map((client) => (
                        <div
                          key={client}
                          className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                        >
                          {client}
                          <button
                            type="button"
                            className="hover:bg-(--gray)/20 p-1 rounded-sm"
                            onClick={() =>
                              setClients((prev) =>
                                prev.filter((value) => value !== client),
                              )
                            }
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      ))}

                      <div className="w-full flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Add a client email..."
                          className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                          value={newClient}
                          onChange={(e) => setNewClient(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newClient.trim()) {
                              setClients((prev) => [newClient.trim(), ...prev]);
                              setNewClient("");
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                          onClick={() => {
                            if (!newClient.trim()) return;
                            setClients((prev) => [newClient.trim(), ...prev]);
                            setNewClient("");
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-px bg-(--gray)" />

                    <p className="text-(--gray-page)">Current co-creators</p>
                    <div className="flex items-center justify-start gap-2 w-full flex-wrap">
                      {coCreators.map((coCreator) => (
                        <div
                          key={coCreator}
                          className="pl-1.5 pr-0.5 py-0.5 rounded-md border border-(--gray-page) text-(--gray-page) flex items-center gap-1"
                        >
                          {coCreator}
                          <button
                            type="button"
                            className="hover:bg-(--gray)/20 p-1 rounded-sm"
                            onClick={() =>
                              setCoCreators((prev) =>
                                prev.filter((value) => value !== coCreator),
                              )
                            }
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Add a co-creator email..."
                      className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
                      value={newCoCreator}
                      onChange={(e) => setNewCoCreator(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newCoCreator.trim()) {
                          setCoCreators((prev) => [
                            newCoCreator.trim(),
                            ...prev,
                          ]);
                          setNewCoCreator("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                      onClick={() => {
                        if (!newCoCreator.trim()) return;
                        setCoCreators((prev) => [newCoCreator.trim(), ...prev]);
                        setNewCoCreator("");
                      }}
                    >
                      Add
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="w-full flex items-center gap-1 mt-1">
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20"
                onClick={closeModal}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
