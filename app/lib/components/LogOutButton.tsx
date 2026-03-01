"use client";

import { LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const LogOutButton = ({ sidebar }: { sidebar: boolean }) => {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setIsSigningOut(false);
      throw error;
    }
  };

  return (
    <>
      {sidebar ? (
        <button
          type="button"
          disabled={isSigningOut}
          onClick={() => void handleSignOut()}
          className="p-1 flex items-center justify-center aspect-square rounded-lg h-full hover:bg-(--darkest-hover) "
        >
          <LogOut size={20} />
        </button>
      ) : (
        <button
          type="button"
          disabled={isSigningOut}
          onClick={() => void handleSignOut()}
          className="p-1 flex items-center justify-center aspect-square rounded-lg h-full hover:bg-(--darkest-hover) "
        >
          <LogOut size={20} />
        </button>
      )}
    </>
  );
};
