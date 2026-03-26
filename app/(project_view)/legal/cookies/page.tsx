const LAST_UPDATED = "March 27, 2026";

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Cookies Policy</p>
      </div>
      <p className="text-(--gray-page)">Last updated: {LAST_UPDATED}</p>
      <p className="text-(--gray-page)">
        This Cookie Policy explains how [COMPANY NAME] uses cookies and similar
        technologies on [APP NAME]. It reflects the current codebase, which uses
        first-party authentication and workspace preference cookies, but does
        not contain a first-party analytics or marketing SDK.
      </p>
      <div className="w-full flex flex-col gap-3">
        <p className="wrap-break-word">
          1. What we use. The service uses cookies and similar technologies to
          keep users signed in, support session continuity, and remember
          interface choices. The first-party items detected in the codebase are
          authentication or session cookies managed by Convex Auth and Next.js,
          the `freelance-sidebar-open` cookie, the `freelance-chat-open` cookie,
          the `freelance-open-tabs` cookie, the
          `freelance-feedback-client-layout` cookie, the
          `freelance-feedback-creator-layout` cookie, and the
          `freelance-guest-upgrade-token` value stored in sessionStorage during
          guest account upgrade.
        </p>
        <p className="wrap-break-word">
          2. Why we use them. Authentication and session cookies are strictly
          necessary to provide authenticated workspace access and secure session
          handling. The workspace preference cookies are functional cookies used
          to remember whether the sidebar or chat is open, which tabs are open,
          and which feedback layout a user selected. The guest-upgrade
          sessionStorage token is a functional similar technology used to link a
          guest account to a permanent account during sign-in.
        </p>
        <p className="wrap-break-word">
          3. Third-party cookies. If you choose Google sign-in, Google may set
          cookies on Google-owned domains. If paid plans or the billing portal
          are enabled, Stripe may set cookies on Stripe-hosted pages. Those
          cookies are governed by the relevant third party on its own domains.
        </p>
        <p className="wrap-break-word">
          4. Categories. Based on the code reviewed on {LAST_UPDATED}, the
          service appears to use strictly necessary and functional cookies only.
          No first-party analytics cookies and no first-party marketing cookies
          were detected in the repository. If non-essential analytics,
          advertising, or similar tracking technologies are introduced later,
          prior opt-in consent should be collected from EU or EEA users before
          those technologies are activated.
        </p>
        <p className="wrap-break-word">
          5. Consent and withdrawal. Under the ePrivacy rules and GDPR,
          non-essential cookies generally require prior consent. The current
          codebase does not yet show a production-grade cookie consent mechanism
          for managing optional cookies. Users can still manage stored cookies
          by adjusting browser settings, deleting cookies, blocking future
          cookies, and signing out to end the active application session.
          Blocking necessary cookies may stop parts of the service from working
          correctly.
        </p>
        <p className="wrap-break-word">
          6. Updates and contact. We may update this Cookie Policy from time to
          time. The latest version will be published here with a revised last
          updated date. Questions about cookies or similar technologies can be
          sent to [EMAIL].
        </p>
      </div>
    </>
  );
}
