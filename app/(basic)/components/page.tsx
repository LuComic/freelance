import { Prologue } from "@/app/lib/components/comp_page/Prologue";
import { RadioPreview } from "@/app/lib/components/comp_page/RadioPreview";
import { SelectPreview } from "@/app/lib/components/comp_page/SelectPreview";

export default function Page() {
  return (
    <div className="w-full mx-auto flex flex-col gap-2 md:max-w-2xl px-4 pt-20 pb-12 sm:px-6 lg:px-8">
      <Prologue />
      <div className="pb-4 flex flex-col gap-2 border-b border-dashed border-(--gray)">
        <p className="md:text-xl text-lg font-medium">Select</p>
        <p className="text-(--gray-page)">
          Select is a simple, but necessary, component in Pageboard. It allows
          you to set certain options for the client, who can then select as many
          of them as they&apos;d like.
        </p>
        <SelectPreview />
      </div>
      <div className="pb-4 flex flex-col gap-2 border-b border-dashed border-(--gray)">
        <p className="md:text-xl text-lg font-medium">Radio</p>
        <p className="text-(--gray-page)">
          Radio is quite similar to the Select component, simple but necessary,
          but instead of multiple options, the client can only pick one option.
        </p>
        <RadioPreview />
      </div>
    </div>
  );
}
