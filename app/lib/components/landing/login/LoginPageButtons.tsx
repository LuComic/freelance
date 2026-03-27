"use client";

import { useAuthActions } from "@convex-dev/auth/react";

type LoginPageButtonsProps = {
  type: "google" | "apple";
  disabled?: boolean;
  redirectTo?: string;
};

export const LoginPageButtons = ({
  type,
  disabled = false,
  redirectTo = "/projects",
}: LoginPageButtonsProps) => {
  const { signIn } = useAuthActions();

  return (
    <>
      {type === "google" ? (
        <button
          type="button"
          disabled={disabled}
          className="rounded-md px-2 py-1 bg-(--google-bg) text-(--google-text) font-medium w-full hover:bg-(--google-bg)/80 border-2 border-(--google-border) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--google-bg)"
          onClick={() => void signIn("google", { redirectTo })}
        >
          Continue with Google
        </button>
      ) : type === "apple" ? (
        <button
          type="button"
          disabled={disabled}
          className="rounded-md px-2 py-1 bg-(--apple-bg) text-(--apple-text) font-medium w-full hover:text-(--apple-text)/80 border-2 border-(--apple-border) disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => void signIn("google", { redirectTo })}
        >
          Continue with Apple
        </button>
      ) : null}
    </>
  );
};
