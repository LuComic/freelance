"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const PageLink = ({ newPage }: { newPage: string }) => {
  const pathname = usePathname();

  return (
    <Link
      href={pathname + "/" + encodeURI(newPage.toLowerCase())}
      className="rounded-md px-2.5 py-1 bg-(--darkest) hover:bg-(--darkest-hover) text-base md:text-lg"
    >
      {newPage}
    </Link>
  );
};
