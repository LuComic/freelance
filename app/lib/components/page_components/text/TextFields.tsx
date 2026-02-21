import { MainHeadline } from "./parts/MainHeadline";
import { SectionHeader } from "./parts/SectionHeader";
import { Subheader } from "./parts/Subheader";

type TextFieldsProps = {
  initialClientLayout?: "grid" | "list";
  initialCreatorLayout?: "grid" | "list";
};

export const TextFields = ({}: TextFieldsProps) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <MainHeadline />
      <SectionHeader />
      <Subheader />
    </div>
  );
};
