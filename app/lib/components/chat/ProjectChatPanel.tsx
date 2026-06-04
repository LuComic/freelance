"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { Send } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  deleteProjectChatMessageMutation,
  listProjectChatMessagesQuery,
  sendProjectChatMessageMutation,
} from "@/lib/convexFunctionReferences";
import {
  clearUnavailableProjectSelection,
  deleteProjectChatMessage,
  EMPTY_PROJECT_PAGES,
  getProjectChatMessages,
  getProjectChatQueryArgs,
  getProjectSelectPlaceholder,
  getSelectedProject,
  handleProjectChatTextareaChange,
  handleProjectChatTextareaKeyDown,
  INITIAL_MESSAGE_COUNT,
  LOAD_MORE_MESSAGE_COUNT,
  ProjectChatText,
  ROLE_LABELS,
  scrollProjectChatAfterSend,
  selectProjectChatProject,
  submitProjectChatMessage,
  syncSelectedProjectFromRoute,
  updateProjectChatTextareaGhostCompletion,
  type GhostCompletion,
  type ProjectChatPanelProps,
  type ProjectOption,
} from "./ChatHelpers";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectChatPanel({ projectId }: ProjectChatPanelProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projectId,
  );
  const [messageBody, setMessageBody] = useState("");
  const [ghostCompletion, setGhostCompletion] = useState<GhostCompletion>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollAfterSendRef = useRef(false);
  const trimmedBody = messageBody.trim();
  const projects = useQuery(api.projects.queries.listCurrentUserProjects) as
    | ProjectOption[]
    | undefined;
  const selectedProject = getSelectedProject(projects, selectedProjectId);
  const selectedProjectPages = selectedProject?.pages ?? EMPTY_PROJECT_PAGES;
  const selectPlaceholder = getProjectSelectPlaceholder(projects);
  const queryArgs = useMemo(
    () => getProjectChatQueryArgs(selectedProjectId),
    [selectedProjectId],
  );
  const { results, status, loadMore } = usePaginatedQuery(
    listProjectChatMessagesQuery,
    queryArgs,
    { initialNumItems: INITIAL_MESSAGE_COUNT },
  );
  const sendMessage = useMutation(sendProjectChatMessageMutation);
  const deleteMessage = useMutation(deleteProjectChatMessageMutation);
  const messages = useMemo(() => getProjectChatMessages(results), [results]);
  const newestMessageId = messages[messages.length - 1]?.id ?? null;

  useEffect(() => {
    return syncSelectedProjectFromRoute({
      projectId,
      setSelectedProjectId,
    });
  }, [projectId]);

  useEffect(() => {
    return clearUnavailableProjectSelection({
      projects,
      selectedProjectId,
      selectedProject,
      setSelectedProjectId,
      setGhostCompletion,
    });
  }, [projects, selectedProject, selectedProjectId]);

  useEffect(() => {
    updateProjectChatTextareaGhostCompletion({
      textareaRef,
      pages: selectedProjectPages,
      setGhostCompletion,
    });
  }, [selectedProjectId, selectedProjectPages]);

  useEffect(() => {
    scrollProjectChatAfterSend({
      newestMessageId,
      messagesEndRef,
      shouldScrollAfterSendRef,
    });
  }, [newestMessageId]);

  return (
    <div className="h-full min-h-0 flex flex-col gap-2">
      <Select
        value={selectedProjectId ?? ""}
        onValueChange={(value) =>
          selectProjectChatProject({
            projectId: value,
            textareaRef,
            setSelectedProjectId,
            setMutationError,
            setMessageBody,
            setGhostCompletion,
          })
        }
        disabled={projects === undefined || projects.length === 0}
      >
        <SelectTrigger className="w-full px-0 border-none font-medium text-lg text-(--light) rounded-none">
          <SelectValue placeholder={selectPlaceholder} />
        </SelectTrigger>
        <SelectContent className="bg-(--quite-dark) border-none text-(--gray-page)">
          <SelectGroup className="bg-(--quite-dark)">
            {(projects ?? []).map((project) => (
              <SelectItem
                key={project.id}
                value={project.id}
                className="data-highlighted:bg-(--quite-dark-hover) data-highlighted:text-(--light) text-base"
              >
                {project.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-2 pr-1">
        {!selectedProjectId ? (
          <div className="text-(--gray)">
            Select a project to use project chat.
          </div>
        ) : null}

        {selectedProjectId && status === "LoadingFirstPage" ? (
          <div className="text-(--gray)">Loading messages...</div>
        ) : null}

        {selectedProjectId && status === "CanLoadMore" ? (
          <button
            type="button"
            onClick={() => loadMore(LOAD_MORE_MESSAGE_COUNT)}
            className="text-xs text-(--gray) hover:text-white rounded-md border border-(--gray) px-2 py-1 self-center"
          >
            Load older
          </button>
        ) : null}

        {selectedProjectId &&
        status !== "LoadingFirstPage" &&
        messages.length === 0 ? (
          <div className="text-(--gray)">No messages yet.</div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className="group flex flex-col gap-1 rounded-md p-2 bg-(--quite-dark)"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2">
                {message.authorImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.authorImage}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : null}
                <span
                  className={`truncate text-sm ${message.isOwn ? "text-(--beautiful-color)" : "text-(--light) opacity-80"}`}
                >
                  {message.authorName}
                </span>
                {message.authorRole ? (
                  <span className="opacity-80 text-xs">
                    {ROLE_LABELS[message.authorRole]}
                  </span>
                ) : null}
              </div>
              {message.canDelete ? (
                <button
                  type="button"
                  onClick={() =>
                    void deleteProjectChatMessage({
                      selectedProjectId,
                      messageId: message.id,
                      deleteMessage,
                      setMutationError,
                    })
                  }
                  className="rounded px-1 text-sm opacity-80 hover:bg-black/20"
                >
                  unsend
                </button>
              ) : null}
            </div>
            <div className="whitespace-pre-wrap wrap-break-word">
              {message.isDeleted || message.body === null ? (
                <span className="italic opacity-75">Message deleted.</span>
              ) : (
                <ProjectChatText
                  text={message.body}
                  pages={selectedProjectPages}
                  projectId={selectedProjectId}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {mutationError ? (
        <div className="text-xs text-red-400">{mutationError}</div>
      ) : null}

      <div className="flex items-end gap-2">
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            rows={1}
            value={messageBody}
            maxLength={1000}
            onChange={(event) =>
              handleProjectChatTextareaChange({
                event,
                textareaRef,
                pages: selectedProjectPages,
                setMessageBody,
                setGhostCompletion,
              })
            }
            onKeyDown={(event) =>
              handleProjectChatTextareaKeyDown({
                event,
                textareaRef,
                pages: selectedProjectPages,
                submitMessage: () => {
                  void submitProjectChatMessage({
                    selectedProjectId,
                    trimmedBody,
                    sending,
                    messageBody,
                    pages: selectedProjectPages,
                    sendMessage,
                    shouldScrollAfterSendRef,
                    textareaRef,
                    setSending,
                    setMutationError,
                    setMessageBody,
                    setGhostCompletion,
                  });
                },
                setMessageBody,
                setGhostCompletion,
              })
            }
            onClick={() =>
              updateProjectChatTextareaGhostCompletion({
                textareaRef,
                pages: selectedProjectPages,
                setGhostCompletion,
              })
            }
            onKeyUp={() =>
              updateProjectChatTextareaGhostCompletion({
                textareaRef,
                pages: selectedProjectPages,
                setGhostCompletion,
              })
            }
            onSelect={() =>
              updateProjectChatTextareaGhostCompletion({
                textareaRef,
                pages: selectedProjectPages,
                setGhostCompletion,
              })
            }
            onScroll={() =>
              updateProjectChatTextareaGhostCompletion({
                textareaRef,
                pages: selectedProjectPages,
                setGhostCompletion,
              })
            }
            placeholder="Message"
            className="block rounded-md bg-(--dim) px-2.5 min-h-10 border border-(--gray) w-full resize-none pt-1.75 pb-1.5 outline-none focus:border-(--vibrant) max-h-32"
          />
          {ghostCompletion ? (
            <span
              aria-hidden
              className="pointer-events-none absolute z-20 leading-6 text-(--vibrant)"
              style={{
                top: ghostCompletion.top,
                left: ghostCompletion.left,
                transform: "translateY(-1.8px)",
              }}
            >
              {ghostCompletion.suffix}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() =>
            void submitProjectChatMessage({
              selectedProjectId,
              trimmedBody,
              sending,
              messageBody,
              pages: selectedProjectPages,
              sendMessage,
              shouldScrollAfterSendRef,
              textareaRef,
              setSending,
              setMutationError,
              setMessageBody,
              setGhostCompletion,
            })
          }
          disabled={!selectedProjectId || !trimmedBody || sending}
          className="aspect-square rounded-md h-10 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-50 disabled:hover:bg-(--vibrant) flex items-center justify-center"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
