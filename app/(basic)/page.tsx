import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="mx-auto w-full md:max-w-7xl px-4 pt-20 pb-12 sm:px-6 lg:px-8">
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
              Build project pages, collect feedback and inputs, track progress,
              and keep communication in one clear place.
              <br />
              <em>
                The site is right now in early beta. Only select people can sign
                up.
              </em>
            </p>

            <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-md bg-(--vibrant) px-1.5 py-0.5 font-medium hover:bg-(--vibrant-hover)"
                prefetch={false}
              >
                Create an Account
              </Link>
              <Link
                href="/projects"
                className="inline-flex h-10 items-center justify-center rounded-md bg-white/90 px-1.5 py-0.5 font-medium text-(--dim) hover:bg-white"
                prefetch={false}
              >
                Join a Project
              </Link>
            </div>
          </div>

          <div className="mt-10 px-2 pb-2 sm:mt-12 sm:px-3 sm:pb-3">
            <div className="overflow-hidden rounded-lg border border-(--gray)">
              <Image
                src="/landing/landing_image.webp"
                alt="Project workspace preview"
                width={3024}
                height={1830}
                preload
                sizes="(min-width: 1280px) 1192px, (min-width: 1024px) calc(100vw - 88px), (min-width: 640px) calc(100vw - 72px), calc(100vw - 48px)"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="mx-auto bg-(--gray)/10 w-full max-w-7xl px-4 scroll-mt-20 py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <h2
          className="text-2xl font-semibold sm:text-3xl"
          style={{ fontFamily: '"Lexend Variable", sans-serif' }}
        >
          What is Pageboard?
        </h2>
        <p className="mt-4 max-w-3xl text-(--gray-page)">
          Pageboard is a client-freelancer communication tool. Instead of
          splitting a project across chat, docs, forms, and boards, you create
          shared pages with components, inputs, feedback, and progress that stay
          tied to the work itself.
        </p>
      </section>

      <section
        id="features"
        className="mx-auto w-full px-4 max-w-7xl scroll-mt-20 py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          <div>
            <p className="font-medium">Pages built for client work</p>
            <p className="mt-3 text-(--gray-page)">
              Create project pages for briefs, updates, approvals, questions,
              and deliverables instead of sending scattered messages.
            </p>
          </div>
          <div>
            <p className="font-medium">Structured feedback and inputs</p>
            <p className="mt-3 text-(--gray-page)">
              Use feedback blocks, selects, radios, idea boards, and text inputs
              directly next to the work so replies stay organised.
            </p>
          </div>
          <div>
            <p className="font-medium">Progress and analytics</p>
            <p className="mt-3 text-(--gray-page)">
              Keep progress visible and review the latest live changes and
              current client selections without digging through conversations.
            </p>
          </div>
        </div>
      </section>

      <section
        id="why"
        className="mx-auto w-full bg-(--gray)/10 px-4 max-w-7xl scroll-mt-20 py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <div className="grid gap-8 md:grid-cols-[1.4fr_0.8fr]">
          <div>
            <h2
              className="text-2xl font-semibold sm:text-3xl"
              style={{ fontFamily: '"Lexend Variable", sans-serif' }}
            >
              Why use it over chat, docs, or generic tools?
            </h2>
            <p className="mt-4 max-w-2xl text-(--gray-page)">
              Most freelance projects end up spread across email, DMs, notes,
              forms, and task boards. Pageboard keeps the client-facing side of
              the project in one place, so it is faster to understand, easier to
              update, and harder for context to get lost.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-(--gray-page)">
            <div>
              <p className="font-medium text-(--light)">What makes it useful</p>
              <p className="mt-2">
                One link for the client instead of a stack of tools.
              </p>
            </div>
            <div>
              <p className="font-medium text-(--light)">
                Better than back-and-forth
              </p>
              <p className="mt-2">
                Feedback, progress, and decisions stay attached to the exact
                page or component they belong to.
              </p>
            </div>
            <div>
              <p className="font-medium text-(--light)">
                Reusable for new work
              </p>
              <p className="mt-2">
                Turn a setup into a repeatable structure for the next client or
                project type.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how"
        className="mx-auto w-full px-4 max-w-7xl scroll-mt-20 py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <div>
            <h2
              className="text-2xl font-semibold sm:text-3xl"
              style={{ fontFamily: '"Lexend Variable", sans-serif' }}
            >
              How does it work?
            </h2>
            <Link
              href="/tutorial"
              target="_blank"
              className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover) cursor-pointer"
              prefetch={false}
            >
              More in-depth tutorial with videos
            </Link>
            <p className="mt-4 max-w-3xl text-(--gray-page)">
              This example shows a client page being built with the Select
              component: first you create the page structure, then you tune each
              component&apos;s settings, and finally the client sees the live
              result.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-(--gray) p-3 sm:p-4">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
              <div>
                <p className="font-medium text-(--gray-page)">Step 1</p>
                <p className="mt-2 text-lg font-medium">Set up the page</p>
                <p className="mt-3 text-(--gray-page)">
                  Start by creating a new page and adding the first sections.
                  This defines what the client needs to see, respond to, or
                  review.
                </p>
              </div>

              <div>
                <Image
                  src="/landing/step1.webp"
                  alt="Creating the base page layout for a Select component example"
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-(--gray) p-3 sm:p-4">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
              <div>
                <p className="font-medium text-(--gray-page)">Step 2</p>
                <p className="mt-2 text-lg font-medium">
                  Adjust component settings
                </p>
                <p className="mt-3 text-(--gray-page)">
                  Edit each block and tweak the Select component options,
                  labels, and behaviour. This is where the page becomes specific
                  to the project and the input you want to collect.
                </p>
              </div>

              <div>
                <Image
                  src="/landing/step2.webp"
                  alt="Tweaking Select component settings while building a client page"
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-(--gray) p-3 sm:p-4">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
              <div>
                <p className="font-medium text-(--gray-page)">Step 3</p>
                <p className="mt-2 text-lg font-medium">Share the live page</p>
                <p className="mt-3 text-(--gray-page)">
                  Live view shows exactly what the client sees. They get one
                  clear page for reviewing progress and responding without extra
                  back-and-forth.
                </p>
              </div>

              <div>
                <Image
                  src="/landing/step3.webp"
                  alt="Live client-facing page view for the Select component example"
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section
        id="plans"
        className="mx-auto w-full px-4 max-w-7xl scroll-mt-20 py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2
              className="text-2xl font-semibold sm:text-3xl"
              style={{ fontFamily: '"Lexend Variable", sans-serif' }}
            >
              No payments in beta testing.
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="relative h-full overflow-hidden rounded-lg border border-(--gray) bg-(--darkest) py-3 px-3.5">
            <div className="relative z-10 flex h-full flex-col gap-4">
              <div className="flex flex-1 flex-col gap-4">
                <p className="font-medium">Free</p>
                <p className="text-(--gray-page)">
                  Join projects as a client or co-creator.
                </p>

                <p className="text-3xl font-semibold">
                  $0
                  <span className="text-base font-medium text-(--gray-page)">
                    /mo
                  </span>
                </p>

                <ul className="space-y-2 text-(--gray-page)">
                  <li>Join shared projects</li>
                  <li>Co-create in invited projects</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative h-full overflow-hidden rounded-lg border border-(--gray) bg-(--darkest) py-3 px-3.5">
            <div className="relative z-10 flex h-full flex-col gap-4">
              <div className="flex flex-1 flex-col gap-4">
                <p className="font-medium">Starter</p>
                <p className="text-(--gray-page)">
                  For getting started with your own work.
                </p>

                <p className="text-3xl font-semibold">
                  $5
                  <span className="text-base font-medium text-(--gray-page)">
                    /mo
                  </span>
                </p>

                <ul className="space-y-2 text-(--gray-page)">
                  <li>Create up to 3 projects</li>
                  <li>Core components included</li>
                  <li>Client sharing and feedback</li>
                </ul>

                <p className="font-medium">Best place to start</p>
              </div>
            </div>
          </div>

          <div className="relative h-full overflow-hidden rounded-lg border border-(--gray) bg-(--darkest) py-3 px-3.5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
              <svg
                viewBox="0 0 900 600"
                className="absolute -right-50 -top-20 h-120 w-120 blur-3xl opacity-40"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <g transform="translate(420.69996617713275 327.69466148331287) scale(0.82 1.35)">
                  <path
                    d="M88.4 -150.2C122.3 -115.7 163.1 -104.4 190.9 -77.3C218.7 -50.1 233.5 -7.2 232.3 36.7C231.1 80.6 213.8 125.4 183.8 158.2C153.7 190.9 111 211.6 70.8 208.4C30.6 205.3 -6.9 178.5 -49 166.4C-91.1 154.3 -137.8 157.1 -158.7 135.9C-179.7 114.7 -175 69.6 -167 32.6C-159 -4.5 -147.7 -33.4 -143.6 -75.2C-139.4 -117 -142.4 -171.6 -119.7 -211.3C-97 -250.9 -48.5 -275.4 -10.6 -258.9C27.2 -242.3 54.4 -184.7 88.4 -150.2"
                    fill="#0061ff"
                  />
                </g>
              </svg>
            </div>
            <div className="relative z-10 flex h-full flex-col gap-4">
              <div className="flex flex-1 flex-col gap-4">
                <p className="font-medium">Pro Unlimited</p>
                <p className="text-(--gray-page)">
                  For active freelancers and small teams shipping often.
                </p>

                <p className="text-3xl font-semibold">
                  $15
                  <span className="text-base font-medium text-(--gray-page)">
                    /mo
                  </span>
                </p>

                <ul className="space-y-2 text-(--gray-page)">
                  <li>Unlimited projects</li>
                  <li>All components included</li>
                  <li>Early access to upcoming features</li>
                </ul>

                <p className="font-medium">Best value for regular use</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-(--gray-page)">
          Corporations and teams can get custom pricing, onboarding, and rollout
          support.
          <a
            href="#contact"
            className="ml-2 underline decoration-(--vibrant) underline-offset-4 hover:text-(--gray)"
          >
            Contact us
          </a>
        </p>
      </section> */}

      <section
        id="create-account"
        className="mx-auto w-full px-4 max-w-7xl scroll-mt-20 pt-8 pb-14 border-t border-(--gray) bg-(--gray)/10"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className="text-2xl font-semibold sm:text-3xl"
              style={{ fontFamily: '"Lexend Variable", sans-serif' }}
            >
              Start with one client page.
            </p>
            <p className="mt-3 max-w-2xl text-(--gray-page)">
              Create your account and build a clearer way to share work, collect
              feedback, and keep projects moving.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-(--vibrant) px-2 py-1 font-medium hover:bg-(--vibrant-hover)"
              prefetch={false}
            >
              Create Account
            </Link>
          </div>
        </div>

        <div id="contact" className="scroll-mt-20 mt-6 text-(--gray-page)">
          Questions?{" "}
          <a
            href="mailto:lukasjaager@gmail.com"
            className="underline decoration-(--vibrant) underline-offset-4"
          >
            lukasjaager@gmail.com
          </a>
        </div>
      </section>

      <footer className="relative overflow-hidden border-t border-(--gray)">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <svg
            viewBox="0 0 900 600"
            className="absolute -bottom-32 right-0 h-120 w-120 blur-3xl opacity-30"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
          >
            <g transform="translate(420.69996617713275 327.69466148331287) scale(0.82 1.35)">
              <path
                d="M88.4 -150.2C122.3 -115.7 163.1 -104.4 190.9 -77.3C218.7 -50.1 233.5 -7.2 232.3 36.7C231.1 80.6 213.8 125.4 183.8 158.2C153.7 190.9 111 211.6 70.8 208.4C30.6 205.3 -6.9 178.5 -49 166.4C-91.1 154.3 -137.8 157.1 -158.7 135.9C-179.7 114.7 -175 69.6 -167 32.6C-159 -4.5 -147.7 -33.4 -143.6 -75.2C-139.4 -117 -142.4 -171.6 -119.7 -211.3C-97 -250.9 -48.5 -275.4 -10.6 -258.9C27.2 -242.3 54.4 -184.7 88.4 -150.2"
                fill="#0061ff"
              />
            </g>
          </svg>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-sm text-(--gray-page)">Built by</p>
            <p className="mt-2 text-lg font-medium">Lukas Jääger</p>
          </div>

          <div className="lg:text-right">
            <p className="text-sm text-(--gray-page)">Project repo</p>
            <a
              className="mt-2 text-lg font-medium"
              target="_blank"
              href="https://github.com/LuComic/freelance"
            >
              freelance-app
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
