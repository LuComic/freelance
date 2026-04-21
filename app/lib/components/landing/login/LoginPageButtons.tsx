"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

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
  const [spinner, setSpinner] = useState(false);
  const startSignIn = async () => {
    if (disabled || spinner) {
      return;
    }

    setSpinner(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "auth:signIn",
          args: {
            provider: "google",
            params: { redirectTo },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Could not start sign in.");
      }

      const result = (await response.json()) as { redirect?: string };

      if (result.redirect) {
        window.location.href = result.redirect;
        return;
      }
    } catch (error) {
      console.error(error);
    }

    setSpinner(false);
  };

  return (
    <>
      {type === "google" ? (
        <button
          type="button"
          disabled={disabled || spinner}
          className="rounded-md px-2 h-9 bg-(--google-bg) text-(--google-text) font-medium w-full hover:bg-(--google-bg)/80 border-2 border-(--google-border) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--google-bg) flex items-center justify-center"
          onClick={() => void startSignIn()}
        >
          {spinner ? <Spinner /> : "Continue with Google"}
        </button>
      ) : type === "apple" ? (
        <button
          type="button"
          disabled={disabled || spinner}
          className="rounded-md px-2 py-1 bg-(--apple-bg) text-(--apple-text) font-medium w-full hover:text-(--apple-text)/80 border-2 border-(--apple-border) disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => void startSignIn()}
        >
          {spinner ? <Spinner /> : "Continue with Apple"}
        </button>
      ) : null}
    </>
  );
};
