"use client";

import { DesktopChat } from "./DesktopChat";
import { MobileChat } from "./MobileChat";

type ChatProps = {
  initialChatOpen?: boolean;
};

export const Chat = ({ initialChatOpen }: ChatProps) => {
  return (
    <>
      <DesktopChat initialOpen={initialChatOpen} />
      <MobileChat />
    </>
  );
};
