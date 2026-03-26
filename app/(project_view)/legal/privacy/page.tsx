const LAST_UPDATED = "March 27, 2026";

export default function Page() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Privacy Policy</p>
      </div>
      <p className="text-(--gray-page)">Last updated: {LAST_UPDATED}</p>
      <p className="text-(--gray-page)">
        This Privacy Policy explains how [COMPANY NAME] processes personal data
        when you use [APP NAME], a collaboration platform used by freelancers,
        clients, and co-creators to create projects, invite other users, join
        workspaces by code, collaborate on page content, submit feedback, manage
        project activity, and, where enabled, handle paid subscriptions.
      </p>
      <div className="w-full flex flex-col gap-3">
        <p className="wrap-break-word">
          1. Data controller. [COMPANY NAME OR SOLE TRADER NAME], registry code
          [REGISTRY CODE, IF APPLICABLE], registered address [ADDRESS], email
          [EMAIL], data protection contact [DPO EMAIL OR &quot;NO DPO
          APPOINTED&quot;]. Replace these placeholders with the real controller
          details before launch.
        </p>
        <p className="wrap-break-word">
          2. Personal data we process. Depending on how you use the service, we
          process account and profile data such as name, email address, profile
          image, biography, internal user ID, anonymous guest status, and email
          verification metadata; authentication and security data such as
          provider account links, session records, refresh token records, and
          verification records; workspace and collaboration data such as
          projects, pages, templates, project descriptions, page content, page
          titles, calendar events, idea board entries, idea form entries,
          feedback items, Kanban items, select and radio responses, activity
          logs, notifications, and searchable profile indexes; relationship and
          access data such as memberships, roles, project invites, invited email
          addresses, friend or collaborator relationships, blocked or hidden
          states, join codes, and former display names; billing data such as
          plan tier, Stripe customer IDs, Stripe subscription IDs, and billing
          status when paid plans are enabled; and device or local state data
          such as first-party interface cookies and the temporary sessionStorage
          guest-upgrade token.
        </p>
        <p className="wrap-break-word">
          3. Purposes and legal bases. We process personal data to create
          accounts, authenticate users, let guests join projects, provide shared
          workspaces, operate projects, pages, templates, collaboration tools,
          notifications, search, and invite flows, secure the service,
          investigate abuse, and, where enabled, manage subscriptions,
          invoicing, and tax compliance. The main legal bases are Article
          6(1)(b) GDPR, contract or pre-contractual steps; Article 6(1)(c) GDPR,
          compliance with legal obligations; Article 6(1)(f) GDPR, our
          legitimate interests in operating and securing the service; and, if
          non-essential analytics or marketing technologies are added later,
          Article 6(1)(a) GDPR, consent.
        </p>
        <p className="wrap-break-word">
          4. Sources of personal data. We receive data directly from you when
          you sign in, edit your profile, create or join a project, submit
          content, feedback, or other workspace changes. We also receive data
          from Google when you use Google OAuth, from other users when they
          invite or connect with you, from Stripe if billing is enabled, and
          from infrastructure providers that necessarily process request
          metadata such as IP addresses and technical logs to deliver and secure
          the service.
        </p>
        <p className="wrap-break-word">
          5. Recipients and visibility. Authorized project members may see your
          display name, email address, profile image, biography, project role,
          invitation status, and activity snapshots where relevant to
          collaboration. We use third-party service providers including Convex
          for backend infrastructure and authentication support, Google for
          OAuth sign-in, Stripe for billing when enabled, and any hosting or CDN
          provider used to deploy the frontend. Add the final hosting provider
          name here: [HOSTING OR CDN PROVIDER NAME].
        </p>
        <p className="wrap-break-word">
          6. International transfers. Some providers may process personal data
          outside the EEA, including in the United States or other jurisdictions
          where their infrastructure operates. Where that happens, we rely on an
          adequacy decision, Standard Contractual Clauses, or another lawful
          transfer mechanism under Chapter V GDPR.
        </p>
        <p className="wrap-break-word">
          7. Retention. We generally keep account and profile data while your
          account remains active and for as long as necessary to provide the
          service, resolve disputes, enforce agreements, or comply with legal
          obligations. Workspace data, project content, invites, notifications,
          and collaboration history are generally kept until the relevant
          account, project, or content is deleted unless longer retention is
          required for legal claims, billing, audit, or security reasons.
          Billing and transaction records may be retained longer where required
          by accounting, tax, or fraud-prevention rules. Cookies remain on your
          device until expiry or deletion.
        </p>
        <p className="wrap-break-word">
          8. Security. We use role-based project permissions, authenticated
          sessions, and provider-managed OAuth login flows. The visible codebase
          does not maintain a standalone password database because local
          password sign-in is not implemented. We apply reasonable technical and
          organizational measures appropriate to the service, but no system can
          be guaranteed to be completely secure.
        </p>
        <p className="wrap-break-word">
          9. Your rights. Subject to GDPR, you may request access,
          rectification, erasure, restriction, objection, withdrawal of consent,
          and data portability where applicable. Some controls already exist in
          the product, including profile editing and account deletion. No
          self-service export tool was found in the current codebase, so
          portability requests should be sent to [EMAIL]. We may need to verify
          your identity before responding.
        </p>
        <p className="wrap-break-word">
          10. Complaints and contact. If you have questions or want to exercise
          your rights, contact [EMAIL]. You also have the right to lodge a
          complaint with a supervisory authority, including the Estonian Data
          Protection Inspectorate at https://www.aki.ee/en. [APP NAME] is not
          directed to children under 16 without the lawful basis and
          authorization required by applicable law. We may update this Privacy
          Policy from time to time by publishing the revised version on this
          page with a new last updated date.
        </p>
      </div>
    </>
  );
}
