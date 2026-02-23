export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="md:text-3xl text-xl font-medium">Cookies Policy</p>
      </div>
      <p className="text-(--gray-page)">
        Placeholder cookies policy text for the platform. Replace this with your
        final cookie categories, purposes, and consent handling details.
      </p>
      <div className="w-full flex flex-col gap-3">
        <p className="wrap-break-word">
          We use cookies and similar technologies to keep you signed in, protect
          your account, remember preferences, and improve performance.
        </p>
        <p className="wrap-break-word">
          Some cookies are necessary for the platform to function, while others
          may support analytics or product improvements depending on your
          settings and applicable consent requirements.
        </p>
        <p className="wrap-break-word">
          This is placeholder copy for UI/testing and should be replaced with
          final legal language before release.
        </p>
      </div>
    </>
  );
}
