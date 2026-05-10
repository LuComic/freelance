import type { Metadata } from "next";
import { canonicalUrl } from "@/app/lib/seo";
import { LoginPageClient } from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Pageboard | Login",
  description:
    "Sign in or create an account to access Pageboard projects and join client workspaces.",
  alternates: {
    canonical: canonicalUrl("/login"),
  },
};

export default function Page() {
  return <LoginPageClient />;
}
