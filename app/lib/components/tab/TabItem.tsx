import { X } from "lucide-react";

interface TabItemProps {
  title: string;
}

export const TabItem = ({ title }: TabItemProps) => {
  return (
    <div className="w-30 px-2 h-10 border border-(--gray) flex items-center border-t border-r  border-l-0 hover:bg-(--darkest-hover) shrink-0 bg-(--darkest) border-b-0">
      <span className="flex items-center justify-between text-sm w-full">
        {title.length > 8 ? title.slice(0, 8) + "..." : title}
        <button className="hover:bg-(--gray) p-1 rounded-md ">
          <X size={18} />
        </button>
      </span>
    </div>
  );
};
