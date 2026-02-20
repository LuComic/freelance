import { MainHeadline } from "./parts/MainHeadline";
import { SectionHeader } from "./parts/SectionHeader";
import { Subheader } from "./parts/Subheader";
import { BodyText } from "./parts/BodyText";

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
      <BodyText />
    </div>
  );
};
