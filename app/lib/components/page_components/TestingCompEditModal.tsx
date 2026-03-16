import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { DatePicker } from "./DatePicker";

type TestingCompEditModalProps = {
  date: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TestingCompEditModal = ({
  date,
  open,
  onOpenChange,
}: TestingCompEditModalProps) => {
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed px-2 inset-0 z-30 flex items-center justify-center bg-black/60"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-h-1/2 h-auto flex flex-col items-start justify-start gap-2 p-3 @[40rem]:max-w-xl bg-(--darkest) rounded-xl overflow-y-auto border border-(--gray)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-start gap-4">
          <p className="@[40rem]:text-3xl text-xl font-medium capitalize">
            Edit event &quot;Event name&quot;
          </p>
          <span className="px-2 py-0.5 border rounded-md border-(--gray-page) text-(--gray-page)">
            {date}. date
          </span>
        </div>
        <p className="text-(--gray-page)">Event name</p>
        <input
          type="text"
          className="rounded-md bg-(--dim) px-2 py-1.5 outline-none w-full"
          placeholder="Project name..."
        />

        <p className="text-(--gray-page)">Event date</p>
        <DatePicker modal={true} />
        <div className="w-full flex items-center gap-1 mt-4">
          <button
            className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--gray) hover:bg-(--gray)/20"
            onClick={() => onOpenChange(false)}
          >
            <X size={16} />
            Cancel
          </button>
          <button className="gap-1 flex items-center justify-center px-2 py-1 rounded-sm w-full border border-(--vibrant) bg-(--vibrant)/10 hover:bg-(--vibrant)/20">
            <Check size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
