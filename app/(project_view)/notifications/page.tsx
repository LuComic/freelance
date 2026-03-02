export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Notifications</p>
      </div>
      <p className="text-(--gray-page)">
        See your latest invites, friend requests, user updates and more.
      </p>
      <div className="flex flex-col w-full">
        <button className="flex items-start justify-start text-left flex-col gap-1 border-y p-2 border-(--gray) w-full hover:bg-(--gray)/20">
          <span className="text-(--gray-page)">02.03.2026</span>
          <p className="font-medium">
            /username/ updated the 'component type' state in /project name/
          </p>
        </button>
        <button className="flex items-start justify-start text-left flex-col gap-1 border-b p-2 border-(--gray) w-full hover:bg-(--gray)/20">
          <span className="text-(--gray-page)">26.02.2026</span>
          <p className="font-medium">/username/ sent you a friend invite</p>
        </button>
      </div>
    </>
  );
}
