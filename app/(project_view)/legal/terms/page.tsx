const LAST_UPDATED = "April 23, 2026";

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">
          Terms of Service
        </p>
      </div>
      <p className="text-(--gray-page)">Last updated: {LAST_UPDATED}</p>
      <p className="text-(--gray-page)">
        These Terms of Service govern your use of Pageboard, a hobby
        collaboration platform for freelancers, clients, and co-creators to
        manage projects, pages, templates, invites, collaboration workflows,
        feedback, and workspace analytics. By using the service, you agree to
        these Terms.
      </p>
      <div className="w-full flex flex-col gap-3">
        <p className="wrap-break-word">
          1. Scope and provider. These Terms form a binding agreement between
          you and Lukas Jääger, the individual operator of Pageboard, based in
          Estonia. They apply to your use of the website, app, authenticated
          workspaces, guest join flows, project templates, and any related paid
          plans or support services made available through Pageboard if those
          are introduced later.
        </p>
        <p className="wrap-break-word">
          2. Accounts and eligibility. You must be at least 18 years old or
          otherwise have full legal capacity to accept these Terms. You may
          create an account using a supported authentication method, currently
          including Google OAuth, or join a project as a temporary guest if that
          flow is available. You must provide accurate information and keep your
          third-party login credentials secure.
        </p>
        <p className="wrap-break-word">
          3. Workspace access. Workspace owners and editors may invite users by
          email or allow entry through join codes. Join codes and invite links
          should be treated as access credentials and must not be shared with
          unauthorized people. We may regenerate, revoke, expire, or disable
          join or invite mechanisms for security, operational, or policy
          reasons.
        </p>
        <p className="wrap-break-word">
          4. Paid plans. The codebase includes subscription and billing support
          through Stripe. If paid plans are enabled, pricing, renewals,
          cancellations, taxes, refunds, and plan limits will be governed by the
          plan information shown at checkout and these Terms. Payment card
          details are handled by Stripe, not stored in the visible application
          code. Until paid plans are launched, any references to subscriptions
          are informational only.
        </p>
        <p className="wrap-break-word">
          5. Your content and responsibilities. You retain ownership of the
          content you submit, but you grant us a non-exclusive license to host,
          store, reproduce, transmit, and display that content as necessary to
          operate, secure, improve, and support the service. You are responsible
          for making sure you have the rights, consents, and lawful basis needed
          to upload or share content and personal data through the platform.
        </p>
        <p className="wrap-break-word">
          6. Acceptable use. You must not use the service for unlawful,
          fraudulent, abusive, infringing, or security-harming activity. You
          must not upload malware, try to gain unauthorized access, interfere
          with service security, misuse invites, impersonate others, harvest
          user data without authorization, or bypass access restrictions or plan
          limits.
        </p>
        <p className="wrap-break-word">
          7. Suspension and termination. We may update, change, suspend, or
          discontinue any part of the service. We may suspend or terminate
          access if we reasonably believe you violated these Terms, created a
          security risk, failed to pay applicable fees, or where suspension is
          required by law. You may stop using the service at any time and may
          use any available account deletion controls subject to legal and
          technical retention requirements.
        </p>
        <p className="wrap-break-word">
          8. Intellectual property and third parties. The service itself,
          including our software, branding, design, and non-user content,
          belongs to Lukas Jääger or its licensors. The service also uses
          third-party providers including Google for authentication and Stripe
          for billing when enabled. Their separate terms and privacy notices may
          also apply.
        </p>
        <p className="wrap-break-word">
          9. Disclaimer and limitation of liability. To the maximum extent
          permitted by law, the service is provided &quot;as is&quot; and
          &quot;as available&quot;. We do not guarantee uninterrupted,
          error-free, or completely secure operation. Pageboard is operated as a
          personal hobby project, and you understand that using any online
          service involves risk. You are responsible for deciding what content
          and personal data to add to the service and for keeping your own
          copies of important content. To the maximum extent permitted by law,
          Lukas Jääger is not responsible for losses, claims, damages, or
          disputes arising from hacking, unauthorized access, security
          incidents, service outages, third-party provider failures, bugs, data
          loss, data corruption, or disclosure of content. To the maximum extent
          permitted by law, we are not liable for indirect or consequential
          damages or for lost profits, revenue, goodwill, or data. Our total
          aggregate liability for claims arising out of or relating to the
          service will not exceed the greater of the amount you paid us in the
          12 months before the claim and EUR 100. Nothing in these Terms limits
          liability that cannot be limited under mandatory law.
        </p>
        <p className="wrap-break-word">
          10. Governing law and disputes. These Terms are governed by the laws
          of Estonia, excluding conflict-of-law rules. Before formal
          proceedings, the parties should try in good faith to resolve disputes
          through written notice sent to lukasjaager@gmail.com. If a dispute
          cannot be resolved amicably, it will be submitted to the competent
          courts of Estonia, unless mandatory consumer law gives you the right
          to proceed elsewhere.
        </p>
        <p className="wrap-break-word">
          11. Updates and contact. We may update these Terms from time to time
          by publishing the revised version here with a new last updated date.
          Continued use of the service after the updated Terms take effect means
          you accept them, except where mandatory law requires a different
          approach. Questions and legal notices should be sent to
          lukasjaager@gmail.com.
        </p>
      </div>
    </>
  );
}
