export const ComponentItem = ({
  compName,
  compDesc,
}: {
  compName: string;
  compDesc: string;
}) => {
  return (
    <div className="w-full h-full min-h-60 md:min-h-50 overflow-hidden border rounded-md border-(--gray) flex flex-col items-start justify-start hover:bg-(--gray)/20">
      <div className="w-full h-40 md:h-30 bg-slate-400"></div>
      <div className="w-full h-auto border-t border-(--gray) p-2 cursor-default">
        <p className="font-medium">{compName}</p>
        <p className="text-(--gray)">{compDesc}</p>
      </div>
    </div>
  );
};
