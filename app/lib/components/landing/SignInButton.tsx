"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export const SignInButton = () => {
  const { signIn } = useAuthActions();

  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-md bg-(--vibrant) px-2 py-1 font-medium hover:bg-(--vibrant-hover)"
      onClick={() => void signIn("google", { redirectTo: "/projects" })}
    >
      Continue with Google
    </button>
  );
};
