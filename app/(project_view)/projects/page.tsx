import Link from "next/link";

const RECENTS = ["Project 1", "Getting started"];

export default function Page() {
  return (
    <div className="h-full @[40rem]:max-w-2/3 mx-auto w-full flex flex-col gap-4 items-start justify-center">
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Welcome back!</p>
      </div>

      <div className="flex @[64rem]:flex-row flex-col items-start @[64rem]:items-center justify-center gap-2">
        <button className="rounded-md bg-(--vibrant) px-2 py-1 hover:bg-(--vibrant-hover)">
          Create project
        </button>
        <span className="text-(--gray-page) @[64rem]:inline hidden">or</span>
        <span className="font-medium @[64rem]:mt-0 mt-4">Join via code</span>
        <form>
          <input
            type="text"
            placeholder="project code"
            className="rounded-md bg-(--darkest) px-2 py-1.5 outline-none"
          />
          <button className="ml-2 rounded-md bg-(--vibrant) px-2 py-1 hover:bg-(--vibrant-hover)">
            Join
          </button>
        </form>
      </div>

      <div className="w-full flex flex-col items-start justify-start overflow-hidden rounded-md border border-(--gray)">
        <div className="w-full flex items-center justify-start p-2 bg-(--darkest) text-(--gray-page) border-b border-(--gray)">
          Open recent
        </div>
        {RECENTS.map((recent, index) => (
          <Link
            className={`w-full flex items-center justify-start p-2 ${index % 2 !== 0 && "bg-(--gray)/10"} hover:bg-(--gray)/20`}
            key={index}
            href=""
          >
            {recent}
          </Link>
        ))}
      </div>
    </div>
  );
}
