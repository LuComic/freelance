"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Send } from "lucide-react";
import {
  deleteProjectChatMessageMutation,
  listProjectChatMessagesQuery,
  sendProjectChatMessageMutation,
} from "@/lib/convexFunctionReferences";

type ProjectChatPanelProps = {
  projectId: string | null;
};

type ProjectChatMessage = {
  id: string;
  authorName: string;
  authorImage: string | null;
  authorRole: "client" | "coCreator" | "owner" | null;
  body: string | null;
  createdAt: number;
  deletedAt: number | null;
  isDeleted: boolean;
  isOwn: boolean;
  canDelete: boolean;
};

const INITIAL_MESSAGE_COUNT = 50;
const LOAD_MORE_MESSAGE_COUNT = 50;
const ROLE_LABELS: Record<
  NonNullable<ProjectChatMessage["authorRole"]>,
  string
> = {
  client: "client",
  coCreator: "co-creator",
  owner: "owner",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (!part.startsWith("http://") && !part.startsWith("https://")) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }

        try {
          const url = new URL(part);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            return <span key={`${part}-${index}`}>{part}</span>;
          }
        } catch {
          return <span key={`${part}-${index}`}>{part}</span>;
        }

        return (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            {part}
          </a>
        );
      })}
    </>
  );
}

export function ProjectChatPanel({ projectId }: ProjectChatPanelProps) {
  const [messageBody, setMessageBody] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollAfterSendRef = useRef(false);
  const trimmedBody = messageBody.trim();
  const queryArgs = useMemo(
    () => (projectId ? { projectId: projectId as never } : "skip"),
    [projectId],
  );
  const { results, status, loadMore } = usePaginatedQuery(
    listProjectChatMessagesQuery,
    queryArgs,
    { initialNumItems: INITIAL_MESSAGE_COUNT },
  );
  const sendMessage = useMutation(sendProjectChatMessageMutation);
  const deleteMessage = useMutation(deleteProjectChatMessageMutation);
  const messages = useMemo(
    () => [...(results as ProjectChatMessage[])].reverse(),
    [results],
  );
  const newestMessageId = messages[messages.length - 1]?.id ?? null;

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const resetTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "";
  };

  useEffect(() => {
    if (!shouldScrollAfterSendRef.current) {
      return;
    }

    shouldScrollAfterSendRef.current = false;
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ block: "end" });
    });
  }, [newestMessageId]);

  const submitMessage = async () => {
    if (!projectId || !trimmedBody || sending) {
      return;
    }

    setSending(true);
    setMutationError(null);

    try {
      await sendMessage({
        projectId: projectId as never,
        body: messageBody,
      });
      shouldScrollAfterSendRef.current = true;
      setMessageBody("");
      requestAnimationFrame(resetTextareaHeight);
    } catch (error) {
      setMutationError(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!projectId) {
      return;
    }

    setMutationError(null);

    try {
      await deleteMessage({
        projectId: projectId as never,
        messageId: messageId as never,
      });
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  };

  if (!projectId) {
    return (
      <div className="text-(--gray)">Open a project to use project chat.</div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col gap-2">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-2 pr-1">
        {status === "LoadingFirstPage" ? (
          <div className="text-(--gray)">Loading messages...</div>
        ) : null}

        {status === "CanLoadMore" ? (
          <button
            type="button"
            onClick={() => loadMore(LOAD_MORE_MESSAGE_COUNT)}
            className="text-xs text-(--gray) hover:text-white rounded-md border border-(--gray) px-2 py-1 self-center"
          >
            Load older
          </button>
        ) : null}

        {status !== "LoadingFirstPage" && messages.length === 0 ? (
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
                  className={`truncate text-sm ${message.isOwn ? "text-(--vibrant)" : "text-(--light) opacity-80"}`}
                >
                  {message.authorName}
                </span>
                {message.authorRole ? (
                  <span className="border opacity-80 px-0.5 rounded-sm text-xs">
                    {ROLE_LABELS[message.authorRole]}
                  </span>
                ) : null}
              </div>
              {message.canDelete ? (
                <button
                  type="button"
                  onClick={() => handleDelete(message.id)}
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
                <LinkifiedText text={message.body} />
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
        <textarea
          ref={textareaRef}
          rows={1}
          value={messageBody}
          maxLength={1000}
          onChange={(event) => {
            setMessageBody(event.target.value);
            requestAnimationFrame(resizeTextarea);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submitMessage();
            }
          }}
          placeholder="Message"
          className="rounded-md bg-(--dim) px-2.5 min-h-10 border border-(--gray) w-full resize-none pt-1.75 pb-1.5 outline-none focus:border-(--vibrant) max-h-32"
        />
        <button
          type="button"
          onClick={() => void submitMessage()}
          disabled={!trimmedBody || sending}
          className="aspect-square rounded-md h-10 bg-(--vibrant) hover:bg-(--vibrant-hover) disabled:opacity-50 disabled:hover:bg-(--vibrant) flex items-center justify-center"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
