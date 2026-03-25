import Image from "next/image";

export const ComponentItem = ({
  compName,
  compDesc,
  previewSrc,
  locked = false,
  onClick,
}: {
  compName: string;
  compDesc: string;
  previewSrc: string;
  locked?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className="w-full h-full min-h-60 md:min-h-50 overflow-hidden border rounded-md border-(--gray) flex flex-col items-start justify-start hover:bg-(--gray)/20 text-left disabled:opacity-70"
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
        <p className="font-medium">
          {compName}{" "}
          {locked ? (
            <span className="text-(--vibrant)">upgrade to pro</span>
          ) : null}
        </p>
        <p className="text-(--gray)">{compDesc}</p>
      </div>
    </button>
  );
};
