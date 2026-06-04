import Link from "next/link";
import type {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  RefObject,
  SetStateAction,
} from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { getCaretCoordinates } from "@/app/lib/components/page_components/testing_editor/caret";
import { getProjectPagePath } from "@/app/lib/components/project/paths";
import {
  completePageTag,
  getPageTagCompletionSuffix,
  getProjectChatTextSegments,
  serializeProjectChatPageTags,
  type ProjectChatPageOption,
} from "./projectChatTagging";

export {
  completePageTag,
  getPageTagCompletionSuffix,
  serializeProjectChatPageTags,
};
export type { ProjectChatPageOption };

export type ProjectChatPanelProps = {
  projectId: string | null;
};

export type ProjectOption = {
  id: string;
  name: string;
  pages: ProjectChatPageOption[];
};

export type ProjectChatMessage = {
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

export type GhostCompletion = {
  suffix: string;
  top: number;
  left: number;
} | null;

export const INITIAL_MESSAGE_COUNT = 50;
export const LOAD_MORE_MESSAGE_COUNT = 50;
export const EMPTY_PROJECT_PAGES: ProjectChatPageOption[] = [];
export const ROLE_LABELS: Record<
  NonNullable<ProjectChatMessage["authorRole"]>,
  string
> = {
  client: "client",
  coCreator: "co-creator",
  owner: "owner",
};

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function resizeProjectChatTextarea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
) {
  const textarea = textareaRef.current;
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function resetProjectChatTextareaHeight(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
) {
  const textarea = textareaRef.current;
  if (!textarea) {
    return;
  }

  textarea.style.height = "";
}

export function getSelectedProject(
  projects: ProjectOption[] | undefined,
  selectedProjectId: string | null,
) {
  return projects?.find((project) => project.id === selectedProjectId) ?? null;
}

export function getProjectSelectPlaceholder(
  projects: ProjectOption[] | undefined,
) {
  if (projects === undefined) {
    return "Loading projects...";
  }

  return projects.length === 0 ? "No projects available" : "Select project";
}

export function getProjectChatQueryArgs(selectedProjectId: string | null) {
  return selectedProjectId
    ? { projectId: selectedProjectId as Id<"projects"> }
    : "skip";
}

export function getProjectChatMessages(results: unknown[]) {
  return [...(results as ProjectChatMessage[])].reverse();
}

export function syncSelectedProjectFromRoute(args: {
  projectId: string | null;
  setSelectedProjectId: Dispatch<SetStateAction<string | null>>;
}) {
  if (!args.projectId) {
    return;
  }

  const frameId = requestAnimationFrame(() => {
    args.setSelectedProjectId(args.projectId);
  });

  return () => cancelAnimationFrame(frameId);
}

export function clearUnavailableProjectSelection(args: {
  projects: ProjectOption[] | undefined;
  selectedProjectId: string | null;
  selectedProject: ProjectOption | null;
  setSelectedProjectId: Dispatch<SetStateAction<string | null>>;
  setGhostCompletion: Dispatch<SetStateAction<GhostCompletion>>;
}) {
  if (
    args.projects === undefined ||
    !args.selectedProjectId ||
    args.selectedProject
  ) {
    return;
  }

  const frameId = requestAnimationFrame(() => {
    args.setSelectedProjectId(null);
    args.setGhostCompletion(null);
  });

  return () => cancelAnimationFrame(frameId);
}

export function selectProjectChatProject(args: {
  projectId: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  setSelectedProjectId: Dispatch<SetStateAction<string | null>>;
  setMutationError: Dispatch<SetStateAction<string | null>>;
  setMessageBody: Dispatch<SetStateAction<string>>;
  setGhostCompletion: Dispatch<SetStateAction<GhostCompletion>>;
}) {
  args.setSelectedProjectId(args.projectId);
  args.setMutationError(null);
  args.setMessageBody("");
  args.setGhostCompletion(null);
  requestAnimationFrame(() => resetProjectChatTextareaHeight(args.textareaRef));
}

export function scrollProjectChatAfterSend(args: {
  newestMessageId: string | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  shouldScrollAfterSendRef: RefObject<boolean>;
}) {
  void args.newestMessageId;

  if (!args.shouldScrollAfterSendRef.current) {
    return;
  }

  args.shouldScrollAfterSendRef.current = false;
  requestAnimationFrame(() => {
    args.messagesEndRef.current?.scrollIntoView({ block: "end" });
  });
}

export function updateProjectChatGhostCompletion(args: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  pages: ProjectChatPageOption[];
  setGhostCompletion: (completion: GhostCompletion) => void;
  value: string;
  cursorPosition: number;
}) {
  const textarea = args.textareaRef.current;
  if (!textarea || args.pages.length === 0) {
    args.setGhostCompletion(null);
    return;
  }

  const suffix = getPageTagCompletionSuffix(
    args.value,
    args.cursorPosition,
    args.pages,
  );
  if (!suffix) {
    args.setGhostCompletion(null);
    return;
  }

  const { top, left } = getCaretCoordinates(textarea, args.cursorPosition);
  args.setGhostCompletion({ suffix, top, left });
}

export function updateProjectChatTextareaGhostCompletion(args: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  pages: ProjectChatPageOption[];
  setGhostCompletion: (completion: GhostCompletion) => void;
}) {
  const textarea = args.textareaRef.current;
  if (!textarea) {
    args.setGhostCompletion(null);
    return;
  }

  updateProjectChatGhostCompletion({
    ...args,
    value: textarea.value,
    cursorPosition: textarea.selectionStart,
  });
}

export function setProjectChatTextareaCaretPosition(args: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  pages: ProjectChatPageOption[];
  setGhostCompletion: (completion: GhostCompletion) => void;
  position: number;
}) {
  requestAnimationFrame(() => {
    const textarea = args.textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.selectionStart = args.position;
    textarea.selectionEnd = args.position;
    textarea.focus();
    updateProjectChatGhostCompletion({
      textareaRef: args.textareaRef,
      pages: args.pages,
      setGhostCompletion: args.setGhostCompletion,
      value: textarea.value,
      cursorPosition: args.position,
    });
  });
}

export function handleProjectChatTextareaChange(args: {
  event: ChangeEvent<HTMLTextAreaElement>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  pages: ProjectChatPageOption[];
  setMessageBody: Dispatch<SetStateAction<string>>;
  setGhostCompletion: Dispatch<SetStateAction<GhostCompletion>>;
}) {
  const nextValue = args.event.target.value;

  args.setMessageBody(nextValue);
  updateProjectChatGhostCompletion({
    textareaRef: args.textareaRef,
    pages: args.pages,
    setGhostCompletion: args.setGhostCompletion,
    value: nextValue,
    cursorPosition: args.event.target.selectionStart,
  });
  requestAnimationFrame(() => resizeProjectChatTextarea(args.textareaRef));
}

export function handleProjectChatTextareaKeyDown(args: {
  event: KeyboardEvent<HTMLTextAreaElement>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  pages: ProjectChatPageOption[];
  submitMessage: () => void;
  setMessageBody: Dispatch<SetStateAction<string>>;
  setGhostCompletion: Dispatch<SetStateAction<GhostCompletion>>;
}) {
  if (args.event.key === "Tab") {
    const completion = completePageTag(
      args.event.currentTarget.value,
      args.event.currentTarget.selectionStart,
      args.pages,
    );

    if (completion) {
      args.event.preventDefault();
      args.setMessageBody(completion.nextValue);
      setProjectChatTextareaCaretPosition({
        textareaRef: args.textareaRef,
        pages: args.pages,
        setGhostCompletion: args.setGhostCompletion,
        position: completion.nextCursor,
      });
      requestAnimationFrame(() => resizeProjectChatTextarea(args.textareaRef));
      return;
    }
  }

  if (args.event.key === "Enter" && !args.event.shiftKey) {
    args.event.preventDefault();
    args.submitMessage();
  }
}

export async function submitProjectChatMessage(args: {
  selectedProjectId: string | null;
  trimmedBody: string;
  sending: boolean;
  messageBody: string;
  pages: ProjectChatPageOption[];
  sendMessage: (args: {
    projectId: Id<"projects">;
    body: string;
  }) => Promise<unknown>;
  shouldScrollAfterSendRef: RefObject<boolean>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  setSending: (sending: boolean) => void;
  setMutationError: (error: string | null) => void;
  setMessageBody: (body: string) => void;
  setGhostCompletion: (completion: GhostCompletion) => void;
}) {
  if (!args.selectedProjectId || !args.trimmedBody || args.sending) {
    return;
  }

  args.setSending(true);
  args.setMutationError(null);

  try {
    await args.sendMessage({
      projectId: args.selectedProjectId as Id<"projects">,
      body: serializeProjectChatPageTags(args.messageBody, args.pages),
    });
    args.shouldScrollAfterSendRef.current = true;
    args.setMessageBody("");
    args.setGhostCompletion(null);
    requestAnimationFrame(() =>
      resetProjectChatTextareaHeight(args.textareaRef),
    );
  } catch (error) {
    args.setMutationError(getErrorMessage(error));
  } finally {
    args.setSending(false);
  }
}

export async function deleteProjectChatMessage(args: {
  selectedProjectId: string | null;
  messageId: string;
  deleteMessage: (args: {
    projectId: Id<"projects">;
    messageId: Id<"projectChatMessages">;
  }) => Promise<unknown>;
  setMutationError: (error: string | null) => void;
}) {
  if (!args.selectedProjectId) {
    return;
  }

  args.setMutationError(null);

  try {
    await args.deleteMessage({
      projectId: args.selectedProjectId as Id<"projects">,
      messageId: args.messageId as Id<"projectChatMessages">,
    });
  } catch (error) {
    args.setMutationError(getErrorMessage(error));
  }
}

function isValidHttpUrl(text: string) {
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ProjectChatText({
  text,
  pages,
  projectId,
}: {
  text: string;
  pages: ProjectChatPageOption[];
  projectId: string | null;
}) {
  const segments = getProjectChatTextSegments(text, pages);
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "page") {
          if (!projectId) {
            return (
              <span
                key={`${segment.pageId}-${index}`}
                className="text-(--gray-page)"
              >
                {segment.title}
              </span>
            );
          }

          return (
            <Link
              key={`${segment.pageId}-${index}`}
              href={getProjectPagePath(projectId, segment.pageId)}
              className="text-(--beautiful-color) underline-offset-4 hover:underline"
            >
              {segment.title}
            </Link>
          );
        }

        if (segment.type === "url" && isValidHttpUrl(segment.text)) {
          return (
            <a
              key={`${segment.text}-${index}`}
              href={segment.text}
              target="_blank"
              rel="noreferrer"
              className="text-(--beautiful-color) underline-offset-4 hover:underline"
            >
              {segment.text}
            </a>
          );
        }

        return <span key={`${segment.text}-${index}`}>{segment.text}</span>;
      })}
    </>
  );
}
