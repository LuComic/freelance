import type { Metadata } from "next";
import { LoginPageClient } from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Pageboard | Login",
  description:
    "Sign in or create an account to access Pageboard projects and join client workspaces.",
};

export default function Page() {
  return <LoginPageClient />;
}
