import Link from "next/link";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Why us?", href: "#why" },
  { label: "Reviews", href: "#reviews" },
  { label: "Plans", href: "#plans" },
  { label: "Contact", href: "#contact" },
];

export const LandingHeader = () => {
  return (
    <header className="fixed top-0 z-20 w-full border-b border-(--gray) bg-(--darkest)/75 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <span
            className="text-xl font-medium tracking-tight"
            style={{ fontFamily: '"Lexend Variable", sans-serif' }}
          >
            Empty Canvas
          </span>
        </a>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-2.5 py-1 font-medium text-(--gray-page) hover:bg-(--darkest-hover) hover:text-(--light)"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="hidden rounded-md border border-(--gray) bg-(--darkest) px-2.5 py-1 font-medium text-(--gray-page) hover:bg-(--darkest-hover) hover:text-(--light) sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="#create-account"
            className="inline-flex rounded-md bg-(--vibrant) px-2.5 py-1 font-medium hover:bg-(--vibrant-hover)"
          >
            Create Account
          </Link>
        </div>
      </div>
    </header>
  );
};
