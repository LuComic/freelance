"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export const LoginPageButtons = ({ type }: { type: "google" | "apple" }) => {
  const { signIn } = useAuthActions();

  return (
    <>
      {type === "google" ? (
        <button
          className="rounded-md px-2 py-1 bg-(--google-bg) text-(--google-text) font-medium w-full hover:bg-(--google-bg)/80 border-2 border-(--google-border)"
          onClick={() => void signIn("google", { redirectTo: "/projects" })}
        >
          Continue with Google
        </button>
      ) : type === "apple" ? (
        <button
          className="rounded-md px-2 py-1 bg-(--apple-bg) text-(--apple-text) font-medium w-full hover:text-(--apple-text)/80 border-2 border-(--apple-border)"
          onClick={() => void signIn("google", { redirectTo: "/projects" })}
        >
          Continue with Apple
        </button>
      ) : null}
    </>
  );
};
