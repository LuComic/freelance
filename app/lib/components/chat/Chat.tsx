"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { setCookie, CHAT_COOKIE } from "@/app/lib/cookies";

type ChatProps = {
  initialChatOpen?: boolean;
};

export const Chat = ({ initialChatOpen }: ChatProps) => {
  const [chatOpen, setChatOpen] = useState(initialChatOpen ?? true);

  useEffect(() => {
    setCookie(CHAT_COOKIE, String(chatOpen));
  }, [chatOpen]);

  useEffect(() => {
    const onKeyDownHandler = (e: KeyboardEvent) => {
      if (
        (e.key === "l" || e.key === "L") &&
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey
      ) {
        setChatOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDownHandler);

    return () => document.removeEventListener("keydown", onKeyDownHandler);
  }, []);

  return (
    <div className="hidden md:block self-stretch">
      {chatOpen ? (
        <nav className="w-[491px] h-full min-h-screen bg-(--darkest) border-l border-(--gray) flex flex-col items-start justify-start p-2 px-3 gap-4">
          <div className="flex items-center justify-start w-full gap-2">
            <button
              onClick={() => setChatOpen((prev) => !prev)}
              className="cursor-pointer p-1 rounded-lg hover:bg-(--darkest-hover)"
            >
              <MessageSquare size={20} />
            </button>
            <span className="text-(--gray) text-xl">Chat</span>
          </div>
        </nav>
      ) : (
        <nav className="w-[50px] h-full min-h-screen bg-(--darkest) border-l border-(--gray) flex flex-col items-center justify-start p-2 gap-4">
          <button
            onClick={() => setChatOpen((prev) => !prev)}
            className="cursor-pointer p-1 rounded-lg hover:bg-(--darkest-hover)"
          >
            <MessageSquare size={20} />
          </button>
        </nav>
      )}
    </div>
  );
};
