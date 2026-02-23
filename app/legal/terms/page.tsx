export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="md:text-3xl text-xl font-medium">Terms of Service</p>
      </div>
      <p className="text-(--gray-page)">
        Placeholder legal text for the platform&apos;s Terms of Service. Replace
        this page with the real document before launch.
      </p>
      <div className="w-full flex flex-col gap-3">
        <p className="wrap-break-word">
          By using this platform, you agree to use it lawfully, respect other
          users, and avoid misuse of collaboration, messaging, and project
          tools. We may suspend accounts that violate these terms.
        </p>
        <p className="wrap-break-word">
          You are responsible for content you upload, client communications, and
          project materials shared through the platform. Keep sensitive data
          secure and only share what you are authorized to use.
        </p>
        <p className="wrap-break-word">
          These terms are placeholder content for UI/testing purposes and do not
          represent final legal language.
        </p>
      </div>
    </>
  );
}
