"use client";

import Link from "next/link";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export const CreateAccButton = () => {
  const [loading, setLoading] = useState(false);

  return (
    <Link
      href="/login"
      className="inline-flex h-10 items-center justify-center rounded-md bg-(--vibrant) w-full md:w-40 font-medium hover:bg-(--vibrant-hover)"
      onClick={() => setLoading(true)}
    >
      {loading ? <Spinner /> : "Create an Account"}
    </Link>
  );
};
