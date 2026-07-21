import PageShell from '../components/PageShell';

const sections = [
  {
    title: '1. Information we collect',
    body: `When you create an Ayinz account, we collect the information you provide directly: your full name, email
    address, password, artiste name, phone number, WhatsApp contact, state of origin, nationality, and social media
    profile link. When you submit a release, we collect the metadata and audio/artwork files you upload. When you
    subscribe to a plan, payment is processed by our payment partner — we do not store your card details ourselves.`,
  },
  {
    title: '2. How we use your information',
    body: `We use your information to create and manage your account, distribute your music to streaming platforms,
    calculate and report royalties and analytics, process subscription payments, respond to support requests, and
    send account-related notifications (such as release status updates). We do not sell your personal information
    to third parties.`,
  },
  {
    title: '3. Referral codes',
    body: `If you sign up using a referral code — whether one given to you by another party or your own personal
    code shared with someone else — that code is stored against your account purely for internal tracking. It is
    not used to validate your account, restrict your access, or share your identity externally.`,
  },
  {
    title: '4. Sharing with third parties',
    body: `To operate the platform, we share limited data with the services that power it: our payment processor
    (to handle subscription billing), our cloud storage provider (to host uploaded audio and artwork), our email
    provider (to send transactional notifications), and the streaming platforms and DSPs your music is distributed
    to (which receive release metadata and artist information necessary to publish and pay out your music).`,
  },
  {
    title: '5. Data retention',
    body: `We retain your account information for as long as your account remains active, and for a reasonable
    period afterward to comply with royalty reporting, tax, and legal obligations. You may request deletion of your
    account and associated data at any time by contacting us, subject to any releases still generating royalties
    that must remain reportable.`,
  },
  {
    title: '6. Your rights',
    body: `You can access, update, or correct your profile information at any time from your account Settings. You
    may request a copy of the data we hold about you, or request that we delete it, by contacting our support team.
    We will respond to verified requests within a reasonable timeframe.`,
  },
  {
    title: '7. Security',
    body: `Passwords are stored using industry-standard hashing and are never visible to our team in plain text.
    We use reasonable technical and organizational safeguards to protect your data, though no online service can
    guarantee absolute security.`,
  },
  {
    title: '8. Cookies',
    body: `We use minimal, functional storage (such as your login session token) to keep you signed in. We do not
    use third-party advertising trackers on the Ayinz platform.`,
  },
  {
    title: '9. Changes to this policy',
    body: `We may update this Privacy Policy from time to time as the platform evolves. Material changes will be
    reflected on this page with an updated effective date.`,
  },
  {
    title: '10. Contact us',
    body: `If you have questions about this Privacy Policy or how your data is handled, reach out to us at
    support@ayinz.com.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="Last updated 2026. This explains what information Ayinz collects, how it's used, and the choices you have."
    >
      <div className="space-y-10">
        {sections.map(s => (
          <div key={s.title}>
            <h2 className="text-sm font-black text-white uppercase tracking-wide mb-3">{s.title}</h2>
            <p className="text-xs md:text-sm text-white/40 font-light leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
