import { IdeaBoradEveryone } from "@/app/lib/components/feedback/IdeaBoardEveryone";

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">
          Feedback and ideas
        </p>
      </div>
      <p className="text-(--gray-page)">
        The project is currently in beta. Your feedback and ideas are greatly
        appreciated, whether it&apos;s about bugs, possible feature, ux improvements
        etc.
      </p>
      <IdeaBoradEveryone />
    </>
  );
}
