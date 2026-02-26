"use client";

import { LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export const LogOutButton = ({ sidebar }: { sidebar: boolean }) => {
  const { signOut } = useAuthActions();

  return (
    <>
      {sidebar ? (
        <button
          onClick={() => void signOut()}
          className="p-1 flex items-center justify-center aspect-square rounded-lg h-full hover:bg-(--darkest-hover) "
        >
          <LogOut size={20} />
        </button>
      ) : (
        <button
          onClick={() => void signOut()}
          className="p-1 flex items-center justify-center aspect-square rounded-lg h-full hover:bg-(--darkest-hover) "
        >
          <LogOut size={20} />
        </button>
      )}
    </>
  );
};
