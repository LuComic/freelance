import Image from "next/image";

export const ComponentItem = ({
  compName,
  compDesc,
  previewSrc,
  onClick,
}: {
  compName: string;
  compDesc: string;
  previewSrc: string;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-full min-h-60 md:min-h-50 overflow-hidden border rounded-md border-(--gray) flex flex-col items-start justify-start hover:bg-(--gray)/20 text-left"
    >
      <div className="w-full h-50 md:h-30 bg-(--dim)">
        <Image
          src={previewSrc}
          alt={`${compName} preview`}
          width={320}
          height={180}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <div className="w-full h-auto border-t border-(--gray) p-2 cursor-default md:text-base text-sm">
        <p className="font-medium">{compName}</p>
        <p className="text-(--gray)">{compDesc}</p>
      </div>
    </button>
  );
};
