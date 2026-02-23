export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="md:text-3xl text-xl font-medium">Privacy Policy</p>
      </div>
      <p className="text-(--gray-page)">
        Placeholder privacy text for the platform. Replace with your real data
        handling and retention policy before launch.
      </p>
      <div className="w-full flex flex-col gap-3">
        <p className="wrap-break-word">
          We collect account information, project content, and collaboration
          activity needed to provide the service. This may include profile
          details, uploaded files, and messages sent through the app.
        </p>
        <p className="wrap-break-word">
          We use this data to operate the platform, improve product features,
          secure accounts, and support collaboration workflows. We do not use
          placeholder text as a substitute for final legal disclosure.
        </p>
        <p className="wrap-break-word">
          You can request access, correction, export, or deletion of your data
          based on the final policy and applicable laws.
        </p>
      </div>
    </>
  );
}
