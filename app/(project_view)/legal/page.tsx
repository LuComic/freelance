import type { Metadata } from "next";
import Link from "next/link";
import { canonicalUrl } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: "Legal | Pageboard",
  description:
    "Access Pageboard legal documents, including cookies, privacy, and terms of service.",
  alternates: {
    canonical: canonicalUrl("/legal"),
  },
};

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Legal</p>
      </div>
      <p className="text-(--gray-page)">
        Here are the legal documentations for this service. These include
        cookies, privacy policy and tos.
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center justify-start">
          -
          <Link
            href="/legal/cookies"
            className="text-(--gray-page) hover:text-(--vibrant)"
          >
            Cookies
          </Link>
        </div>
        <div className="flex gap-2 items-center justify-start">
          -
          <Link
            href="/legal/cookies"
            className="text-(--gray-page) hover:text-(--vibrant)"
          >
            Privacy
          </Link>
        </div>
        <div className="flex gap-2 items-center justify-start">
          -
          <Link
            href="/legal/terms"
            className="text-(--gray-page) hover:text-(--vibrant)"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </>
  );
}
