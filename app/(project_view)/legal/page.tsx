import Link from "next/link";

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
      <span>
        -{" "}
        <Link
          href="/legal/cookies"
          className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
        >
          Cookies
        </Link>
      </span>

      <span>
        -{" "}
        <Link
          href="/legal/cookies"
          className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
        >
          Privacy
        </Link>
      </span>

      <span>
        -{" "}
        <Link
          href="/legal/terms"
          className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover)"
        >
          Terms of Service
        </Link>
      </span>
    </>
  );
}
