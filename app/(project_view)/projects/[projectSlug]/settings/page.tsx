"use client";

import { ChevronRight, Trash } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [generalOpen, setGeneralOpen] = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);
  const [coCreatorsOpen, setCoCreatorsOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);

  const [projectName, setProjectName] = useState("Freelance Website Redesign");
  const [newProjectName, setNewProjectName] = useState("");

  const [clients, setClients] = useState([
    "alice@client.co",
    "brand-team@client.co",
  ]);
  const [newClient, setNewClient] = useState("");

  const [coCreators, setCoCreators] = useState([
    "marco@studio.co",
    "sara@studio.co",
  ]);
  const [newCoCreator, setNewCoCreator] = useState("");

  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Project Settings</p>
      </div>
      <p className="text-(--gray-page)">
        Manage project details, collaborators, and platform settings for this
        workspace.
      </p>

      <div className="flex flex-col items-start justify-start w-full">
        <div className="w-full p-2 flex flex-col gap-2">
          <button
            type="button"
            className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
            onClick={() => setGeneralOpen((prev) => !prev)}
          >
            <ChevronRight
              size={20}
              className={`${generalOpen ? "rotate-90" : "rotate-0"}`}
            />
            General
          </button>

          {generalOpen ? (
            <div className="pl-7 flex flex-col gap-2 pb-2">
              <p className="text-(--gray-page)">Project name</p>
              <div className="w-max rounded-md border px-2 py-1 border-(--gray)">
                {projectName}
              </div>

              <p className="text-(--gray-page)">Rename project</p>
              <input
                type="text"
                placeholder="Enter a new project name..."
                className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const nextValue = newProjectName.trim();
                    if (!nextValue) return;
                    setProjectName(nextValue);
                    setNewProjectName("");
                  }
                }}
              />
              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                onClick={() => {
                  const nextValue = newProjectName.trim();
                  if (!nextValue) return;
                  setProjectName(nextValue);
                  setNewProjectName("");
                }}
              >
                Add
              </button>
            </div>
          ) : null}
        </div>

        <div className="bg-(--gray)/10 w-full p-2 flex flex-col gap-2">
          <button
            type="button"
            className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
            onClick={() => setClientsOpen((prev) => !prev)}
          >
            <ChevronRight
              size={20}
              className={`${clientsOpen ? "rotate-90" : "rotate-0"}`}
            />
            Clients
          </button>

          {clientsOpen ? (
            <div className="pl-7 flex flex-col gap-2 pb-2">
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
              </div>

              <p className="text-(--gray-page)">Manage clients</p>
              <input
                type="text"
                placeholder="Add a client email..."
                className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const nextValue = newClient.trim();
                    if (!nextValue) return;
                    setClients((prev) => [nextValue, ...prev]);
                    setNewClient("");
                  }
                }}
              />
              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                onClick={() => {
                  const nextValue = newClient.trim();
                  if (!nextValue) return;
                  setClients((prev) => [nextValue, ...prev]);
                  setNewClient("");
                }}
              >
                Add
              </button>
            </div>
          ) : null}
        </div>

        <div className="w-full p-2 flex flex-col gap-2">
          <button
            type="button"
            className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
            onClick={() => setCoCreatorsOpen((prev) => !prev)}
          >
            <ChevronRight
              size={20}
              className={`${coCreatorsOpen ? "rotate-90" : "rotate-0"}`}
            />
            Co-creators
          </button>

          {coCreatorsOpen ? (
            <div className="pl-7 flex flex-col gap-2 pb-2">
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

              <p className="text-(--gray-page)">Manage co-creators</p>
              <input
                type="text"
                placeholder="Add a co-creator email..."
                className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
                value={newCoCreator}
                onChange={(e) => setNewCoCreator(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const nextValue = newCoCreator.trim();
                    if (!nextValue) return;
                    setCoCreators((prev) => [nextValue, ...prev]);
                    setNewCoCreator("");
                  }
                }}
              />
              <button
                type="button"
                className="w-max rounded-md px-2 py-1 bg-(--vibrant) hover:bg-(--vibrant-hover)"
                onClick={() => {
                  const nextValue = newCoCreator.trim();
                  if (!nextValue) return;
                  setCoCreators((prev) => [nextValue, ...prev]);
                  setNewCoCreator("");
                }}
              >
                Add
              </button>
            </div>
          ) : null}
        </div>

        <div className="bg-(--gray)/10 w-full p-2 flex flex-col gap-2">
          <button
            type="button"
            className="flex font-medium @[40rem]:text-lg text-base items-center justify-start gap-2"
            onClick={() => setDangerOpen((prev) => !prev)}
          >
            <ChevronRight
              size={20}
              className={`${dangerOpen ? "rotate-90" : "rotate-0"}`}
            />
            Danger zone
          </button>

          {dangerOpen ? (
            <div className="pl-7 flex flex-col gap-2 pb-2">
              <p className="text-(--gray-page)">Delete project</p>
              <button
                type="button"
                className="w-max rounded-md border px-2 py-1 border-(--declined-border) bg-(--declined-bg)/10 hover:bg-(--declined-bg)/20"
              >
                Delete project
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
