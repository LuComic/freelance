export default function ProjectPageLoading() {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="h-6 w-48 rounded-md bg-(--gray)/10 animate-pulse" />
      <div className="h-6 w-60 rounded-md bg-(--gray)/10 animate-pulse" />
      <div className="h-6 w-20 rounded-md bg-(--gray)/10 animate-pulse" />
    </div>
  );
}
