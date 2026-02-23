import Image from "next/image";

export default function Home() {
  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pt-20 pb-12 sm:px-6 lg:px-8">
        <div className="relative z-10 flex min-h-136 flex-col">
          <div className="flex flex-col items-center text-center">
            <h1
              className="text-3xl leading-tight font-semibold sm:text-5xl"
              style={{ fontFamily: '"Lexend Variable", sans-serif' }}
            >
              Empty Canvas
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-(--gray-page) sm:text-xl sm:leading-8">
              Build premium client project pages faster.
            </p>

            <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="#create-account"
                className="inline-flex h-10 items-center justify-center rounded-md bg-(--vibrant) px-2.5 py-1 font-medium hover:bg-(--vibrant-hover)"
              >
                Create Account
              </a>
              <a
                href="#about"
                className="inline-flex h-10 items-center justify-center rounded-md bg-white/90 px-2.5 py-1 font-medium text-(--dim) hover:bg-white"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="mt-10 px-2 pb-2 sm:mt-12 sm:px-3 sm:pb-3">
            <div className="overflow-hidden rounded-lg border border-(--gray)">
              <Image
                src="/landing/landing_image.webp"
                alt="Project workspace preview"
                width={1600}
                height={920}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="mx-auto w-full max-w-7xl md:px-0 px-4 py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <h2
          className="text-2xl font-semibold sm:text-3xl"
          style={{ fontFamily: '"Lexend Variable", sans-serif' }}
        >
          Built for quick first impressions
        </h2>
        <p className="mt-4 max-w-3xl leading-8 text-(--gray-page)">
          Empty Canvas helps freelancers and small teams present work clearly,
          collect feedback, and keep progress visible in one place. It is made
          to be easy to understand on first open.
        </p>
      </section>

      <section
        id="features"
        className="mx-auto w-full md:px-0 px-4 max-w-7xl py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          <div>
            <p className="font-medium">Progress boards</p>
            <p className="mt-3 leading-7 text-(--gray-page)">
              Clear Todo, In Progress, and Done views that clients understand
              fast.
            </p>
          </div>
          <div>
            <p className="font-medium">Feedback built in</p>
            <p className="mt-3 leading-7 text-(--gray-page)">
              Keep notes, questions, and approvals next to the work.
            </p>
          </div>
          <div>
            <p className="font-medium">Reusable setups</p>
            <p className="mt-3 leading-7 text-(--gray-page)">
              Start from a clean structure and adapt it to each project.
            </p>
          </div>
        </div>
      </section>

      <section
        id="why"
        className="mx-auto w-full md:px-0 px-4 max-w-7xl py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <div className="grid gap-8 md:grid-cols-[1.4fr_0.8fr]">
          <div>
            <h2
              className="text-2xl font-semibold sm:text-3xl"
              style={{ fontFamily: '"Lexend Variable", sans-serif' }}
            >
              Quick to understand. Easy to keep updated.
            </h2>
            <p className="mt-4 max-w-2xl leading-8 text-(--gray-page)">
              The page is designed for fast first impressions, but the structure
              is practical enough for daily client communication.
            </p>
          </div>
        </div>
      </section>

      <section
        id="reviews"
        className="mx-auto w-full md:px-0 px-4 max-w-7xl py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <p
          className="max-w-4xl text-xl leading-relaxed font-medium sm:text-2xl"
          style={{ fontFamily: '"Lexend Variable", sans-serif' }}
        >
          “Clients understand the page immediately, and I spend less time
          explaining status in calls.”
        </p>
        <p className="mt-4 text-(--gray-page)">John Doe, Freelance Designer</p>
      </section>

      <section
        id="plans"
        className="mx-auto w-full md:px-0 px-4 max-w-7xl py-8 sm:pt-6 lg:pt-8 border-t border-(--gray)"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2
              className="text-2xl font-semibold sm:text-3xl"
              style={{ fontFamily: '"Lexend Variable", sans-serif' }}
            >
              Start free, upgrade when you need more
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-(--gray) bg-(--darkest) p-5">
            <p className="font-medium">Free</p>
            <p className="mt-3 leading-7 text-(--gray-page)">
              Join projects as a client or co-creator.
            </p>

            <p className="mt-5 text-3xl font-semibold">
              $0
              <span className="text-base font-medium text-(--gray-page)">
                /mo
              </span>
            </p>

            <ul className="mt-5 space-y-2 leading-7 text-(--gray-page)">
              <li>Join shared projects</li>
              <li>Comment and review</li>
              <li>Co-create in invited projects</li>
            </ul>
          </div>

          <div className="rounded-lg border border-(--gray) bg-(--darkest) p-5">
            <p className="font-medium">Starter</p>
            <p className="mt-3 leading-7 text-(--gray-page)">
              For getting started with your own work.
            </p>

            <p className="mt-5 text-3xl font-semibold">
              $16
              <span className="text-base font-medium text-(--gray-page)">
                /mo
              </span>
            </p>

            <ul className="mt-5 space-y-2 leading-7 text-(--gray-page)">
              <li>Create up to 3 projects</li>
              <li>Core components included</li>
              <li>Client sharing and feedback</li>
            </ul>

            <p className="mt-5 font-medium">Best place to start</p>
          </div>

          <div className="rounded-lg border border-(--vibrant) bg-(--darkest) p-5">
            <p className="font-medium">Pro Unlimited</p>
            <p className="mt-3 leading-7 text-(--gray-page)">
              For active freelancers and small teams shipping often.
            </p>

            <p className="mt-5 text-3xl font-semibold">
              $22
              <span className="text-base font-medium text-(--gray-page)">
                /mo
              </span>
            </p>

            <ul className="mt-5 space-y-2 leading-7 text-(--gray-page)">
              <li>Unlimited projects</li>
              <li>All components included</li>
              <li>Early access to upcoming features</li>
            </ul>

            <p className="mt-5 font-medium">Best value for regular use</p>
          </div>
        </div>

        <p className="mt-6 leading-7 text-(--gray-page)">
          Corporations and teams can get custom pricing, onboarding, and rollout
          support.
          <a
            href="#contact"
            className="ml-2 underline decoration-(--vibrant) underline-offset-4 hover:text-(--gray)"
          >
            Contact us
          </a>
        </p>
      </section>

      <section
        id="create-account"
        className="mx-auto w-full md:px-0 px-4 max-w-7xl pt-8 pb-14 border-t border-(--gray)"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className="text-2xl font-semibold sm:text-3xl"
              style={{ fontFamily: '"Lexend Variable", sans-serif' }}
            >
              Start simple. Upgrade later.
            </p>
            <p className="mt-3 max-w-2xl leading-7 text-(--gray-page)">
              Create your account and ship your first client page today.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="#"
              className="inline-flex h-10 items-center justify-center rounded-md bg-(--vibrant) px-2.5 py-1 font-medium hover:bg-(--vibrant-hover)"
            >
              Create Account
            </a>
            <a
              href="#contact"
              className="inline-flex h-10 items-center justify-center rounded-md border border-(--gray) bg-(--quite-dark) px-2.5 py-1 font-medium hover:bg-(--darkest-hover)"
            >
              Contact
            </a>
          </div>
        </div>

        <div id="contact" className="mt-6 text-(--gray-page)">
          Questions?{" "}
          <a
            href="mailto:hello@example.com"
            className="underline decoration-(--vibrant) underline-offset-4"
          >
            hello@example.com
          </a>
        </div>
      </section>
    </>
  );
}
