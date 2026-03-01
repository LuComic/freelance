import { X } from "lucide-react";

interface TabItemProps {
  pageTitle: string;
  projectName: string;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

function truncateLabel(value: string, maxLength = 8) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export const TabItem = ({
  pageTitle,
  projectName,
  isActive,
  onSelect,
  onClose,
}: TabItemProps) => {
  return (
    <div
      className={`flex h-9 min-w-[150px] shrink-0 items-center border-b-0 border-l-0 border-r border-t border-(--gray) ${
        isActive
          ? "bg-(--quite-dark)"
          : "bg-(--darkest) hover:bg-(--darkest-hover)"
      }`}
    >
      <button
        type="button"
        className="min-w-0 flex-1 px-3 py-2 text-left"
        onClick={onSelect}
      >
        <span className="flex min-w-0 items-center gap-2 text-sm">
          <span className="truncate text-(--light)">
            {truncateLabel(pageTitle)}
          </span>
          <span className="truncate text-(--gray-page)">
            {truncateLabel(projectName)}
          </span>
        </span>
      </button>
      <button
        type="button"
        className="mr-2 rounded-md p-1 text-(--gray) hover:bg-(--gray)/20 hover:text-(--light)"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
