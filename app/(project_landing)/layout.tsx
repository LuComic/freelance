import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "../ConvexClientProvider";

export const metadata: Metadata = {
  title: "Pageboard",
  description: "The best platform for client-freelancer communication.",
};

export default function ProjectsIndexLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <main
          className="antialiased min-h-dvh w-full overflow-x-hidden bg-(--quite-dark) text-(--light) md:px-4 px-2 pt-4 pb-8"
          style={{
            scrollbarColor: "gray transparent",
            scrollbarWidth: "thin",
          }}
        >
          {children}
        </main>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
