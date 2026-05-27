import Image from "next/image";
import Link from "next/link";
import { CreateAccButton } from "../lib/components/landing/CreateAccButton";
import { LedBackground } from "../lib/components/landing/LedBackground";
import type { Metadata } from "next";
import { canonicalUrl } from "../lib/seo";

export const metadata: Metadata = {
  title: "Client Workspace for Freelancers | Pageboard",
  description: "A client-facing workspace for freelancers and small teams.",
  alternates: {
    canonical: canonicalUrl(),
  },
};

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-(--dim) flex flex-col @container">
      <section className="relative z-10 w-full px-4 pt-20 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full md:max-w-7xl">
          <LedBackground />
          <div className="relative z-10 flex min-h-136 flex-col">
            <div className="flex flex-col items-center text-center">
              <h1
                className="text-3xl leading-tight font-semibold sm:text-5xl"
                style={{ fontFamily: '"Lexend Variable", sans-serif' }}
              >
                Pageboard
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-(--gray-page) sm:text-xl sm:leading-8">
                A client-facing workspace for freelancers and small teams.
                <br />
                <span className="md:inline hidden">
                  Projects, feedback, progress, and more - all in one clear
                  place.
                </span>
              </p>

              <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                <CreateAccButton />
                <Link
                  href="/projects"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-white/90 md:w-max md:px-1.5 font-medium text-(--dim) hover:bg-white w-full"
                >
                  Join a Project
                </Link>
              </div>
            </div>

            <div className="mt-10 px-2 pb-2 sm:mt-12 sm:px-3 sm:pb-3">
              <div className="overflow-hidden rounded-lg border border-(--gray)">
                <Image
                  src="/landing/hero.png"
                  alt="Project workspace preview"
                  width={3002}
                  height={1822}
                  preload
                  sizes="(min-width: 1280px) 1192px, (min-width: 1024px) calc(100vw - 88px), (min-width: 640px) calc(100vw - 72px), calc(100vw - 48px)"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 w-full scroll-mt-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-4 lg:py-18">
          <h2
            className="text-2xl font-semibold sm:text-3xl"
            style={{ fontFamily: '"Lexend Variable", sans-serif' }}
          >
            <span className="text-(--beautiful-color)">* </span>
            What is Pageboard?
            <span className="text-(--beautiful-color)"> *</span>
          </h2>
          <p className="mt-4 max-w-3xl text-(--gray-page) text-lg leading-loose">
            Pageboard is a client-freelancer communication tool. Instead of
            splitting a project across chat, docs, forms, and boards, you create
            shared pages with components, inputs, feedback, and progress that
            stay tied to the work itself.
          </p>
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 w-full scroll-mt-16 bg-(--darkest)"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-4 lg:py-18">
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
            <div>
              <p className="font-medium text-xl">Pages built for client work</p>
              <p className="mt-3 text-(--gray-page) text-lg leading-loose">
                Create project pages for briefs, updates, approvals, questions,
                and deliverables instead of sending scattered messages.
              </p>
            </div>
            <div>
              <p className="font-medium text-xl">
                Structured feedback and inputs
              </p>
              <p className="mt-3 text-(--gray-page) text-lg leading-loose">
                Use feedback blocks, selects, radios, idea boards, and text
                inputs directly next to the work so replies stay organised.
              </p>
            </div>
            <div>
              <p className="font-medium text-xl">Progress and analytics</p>
              <p className="mt-3 text-(--gray-page) text-lg leading-loose">
                Keep progress visible and review the latest live changes and
                current client selections without digging through conversations.
              </p>
            </div>
          </div>
          <Link
            href="/components"
            className="text-(--vibrant) mt-4 inline-block underline underline-offset-4 hover:text-(--vibrant-hover) cursor-pointer text-lg"
          >
            Check out Pageboard&apos;s component selection
          </Link>
        </div>
      </section>

      <section id="why" className="relative z-10 w-full scroll-mt-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-4 lg:py-18">
          <div className="grid gap-8 md:grid-cols-[1.4fr_0.8fr]">
            <div>
              <h2
                className="text-2xl font-semibold sm:text-3xl"
                style={{ fontFamily: '"Lexend Variable", sans-serif' }}
              >
                <span className="text-(--beautiful-color)">* </span>
                Why use it over chat, docs, or generic tools?
                <span className="text-(--beautiful-color)"> *</span>
              </h2>
              <p className="mt-4 max-w-2xl text-(--gray-page) text-lg leading-loose">
                Most freelance projects end up spread across email, DMs, notes,
                forms, and task boards. Pageboard keeps the client-facing side
                of the project in one place, so it is faster to understand,
                easier to update, and harder for context to get lost.
              </p>
            </div>
            <div className="flex flex-col gap-4 text-(--gray-page)">
              <div>
                <p className="font-medium text-(--light) text-lg">
                  What makes it useful
                </p>
                <p className="mt-2 text-lg leading-loose">
                  One link for the client instead of a stack of tools.
                </p>
              </div>
              <div>
                <p className="font-medium text-(--light) text-lg">
                  Better than back-and-forth
                </p>
                <p className="mt-2 text-lg leading-loose">
                  Feedback, progress, and decisions stay attached to the exact
                  page or component they belong to.
                </p>
              </div>
              <div>
                <p className="font-medium text-(--light) text-lg">
                  Reusable for new work
                </p>
                <p className="mt-2 text-lg leading-loose">
                  Turn a setup into a repeatable structure for the next client
                  or project type.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how"
        className="relative z-10 w-full scroll-mt-16 bg-(--darkest)"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-4 lg:py-18">
          <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
            <div>
              <h2
                className="text-2xl font-semibold sm:text-3xl"
                style={{ fontFamily: '"Lexend Variable", sans-serif' }}
              >
                <span className="text-(--beautiful-color)">* </span>
                How does it work?
                <span className="text-(--beautiful-color)"> *</span>
              </h2>
              <Link
                href="/tutorial"
                target="_blank"
                className="text-(--vibrant) mt-2 inline-block underline underline-offset-4 hover:text-(--vibrant-hover) cursor-pointer text-lg"
              >
                More in-depth tutorial with videos
              </Link>
              <p className="mt-4 max-w-3xl text-(--gray-page) text-lg leading-loose">
                This example shows a client page being built with the Select
                component: first you create the page structure, then you tune
                each component&apos;s settings, and finally the client sees the
                live result.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="border-b border-(--gray) p-3 sm:p-4">
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
                <div>
                  <p className="font-medium text-(--gray-page)">Step 1</p>
                  <p className="mt-2 text-xl font-medium">Set up the page</p>
                  <p className="mt-3 text-(--gray-page) text-lg leading-loose">
                    Start by creating a new page and adding the first sections.
                    This defines what the client needs to see, respond to, or
                    review.
                  </p>
                </div>

                <div>
                  <Image
                    src="/landing/step1.png"
                    alt="Creating the base page layout for a Select component example"
                    width={778}
                    height={426}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-(--gray) p-3 sm:p-4">
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
                <div>
                  <p className="font-medium text-(--gray-page)">Step 2</p>
                  <p className="mt-2 text-xl font-medium">
                    Adjust component settings
                  </p>
                  <p className="mt-3 text-(--gray-page) text-lg leading-loose">
                    Edit each block and tweak the Select component options,
                    labels, and behaviour. This is where the page becomes
                    specific to the project and the input you want to collect.
                  </p>
                </div>

                <div>
                  <Image
                    src="/landing/step2.jpg"
                    alt="Tweaking Select component settings while building a client page"
                    width={1148}
                    height={1120}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
                <div>
                  <p className="font-medium text-(--gray-page)">Step 3</p>
                  <p className="mt-2 text-xl font-medium">
                    Share the live page
                  </p>
                  <p className="mt-3 text-(--gray-page) text-lg leading-loose">
                    Live view shows exactly what the client sees. They get one
                    clear page for reviewing progress and responding without
                    extra back-and-forth.
                  </p>
                </div>

                <div>
                  <Image
                    src="/landing/step3.png"
                    alt="Live client-facing page view for the Select component example"
                    width={1474}
                    height={982}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="create-account"
        className="relative z-10 mb-8 w-full scroll-mt-16"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-4 lg:py-18">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2
                className="text-2xl font-semibold sm:text-3xl"
                style={{ fontFamily: '"Lexend Variable", sans-serif' }}
              >
                <span className="text-(--beautiful-color)">* </span>
                Completely free.
                <span className="text-(--beautiful-color)"> *</span>
              </h2>
              <p className="mt-3 max-w-2xl text-(--gray-page) text-lg leading-loose">
                Create your account and build a clearer way to share work,
                collect feedback, and keep projects moving.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <CreateAccButton />
            </div>
          </div>

          <div
            id="contact"
            className="scroll-mt-16 mt-6 text-(--gray-page) text-lg"
          >
            Questions?{" "}
            <a
              href="mailto:lukasjaager@gmail.com"
              className="underline decoration-(--vibrant) underline-offset-4"
              target="_blank"
            >
              lukasjaager@gmail.com
            </a>
            <br />
            If you&apos;d like to support the project or me, check out my{" "}
            <a
              href="https://ko-fi.com/ainurakk"
              className="underline decoration-(--vibrant) underline-offset-4"
              target="_blank"
            >
              Ko-fi page
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
