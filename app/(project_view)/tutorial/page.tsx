import { TutorialCreator } from "@/app/lib/components/tutorial/TutorialCreator";
import { TutorialClient } from "@/app/lib/components/tutorial/TutorialClient";
import { TutorialInDepth } from "@/app/lib/components/tutorial/TutorialInDepth";

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">
          Tutorial and demo
        </p>
      </div>
      <p className="text-(--gray-page)">
        A basic example of how the platform works, from the
        creator/freelancer&apos;s and client&apos;s view.
        <br />
        The example scenario - John Doe needs a website so the freelancer
        creates a Pageboard project to collect their preferences.
      </p>
      <div className="flex flex-col items-start justify-start w-full">
        <TutorialCreator />
        <TutorialClient />
        <TutorialInDepth />
      </div>
    </>
  );
}
