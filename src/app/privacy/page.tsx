export const runtime = 'edge'

import type { Metadata } from 'next'
import Link from 'next/link'
import { CookiePreferencesLink } from '@/components/layout/CookiePreferencesLink'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How sergioluque.com handles personal data, cookies, analytics, and your rights under the GDPR.',
  alternates: { canonical: '/privacy' },
}

const LAST_UPDATED = '28 April 2026'
const CONTROLLER_EMAIL = 'mail@sergioluque.com'

const h2: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono)',
  fontSize: '15px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginTop: '48px',
  marginBottom: '12px',
  color: 'var(--text-primary)',
}

const h3: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono)',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginTop: '24px',
  marginBottom: '8px',
  color: 'var(--text-secondary)',
}

const p: React.CSSProperties = {
  fontFamily: 'var(--font-ibm-plex-sans)',
  fontSize: '15px',
  lineHeight: 1.7,
  color: 'var(--text-secondary)',
  margin: '0 0 12px',
}

const ul: React.CSSProperties = {
  fontFamily: 'var(--font-ibm-plex-sans)',
  fontSize: '15px',
  lineHeight: 1.7,
  color: 'var(--text-secondary)',
  margin: '0 0 12px',
  paddingLeft: '20px',
}

const meta: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono)',
  fontSize: '11px',
  color: 'var(--text-muted)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="page-shell" style={{ maxWidth: '760px' }}>
      <h1 className="t-h1" style={{ marginBottom: '8px' }}>
        Privacy policy
      </h1>
      <p style={meta}>Last updated: {LAST_UPDATED}</p>

      <h2 style={h2}>1. Who we are</h2>
      <p style={p}>
        This site, <strong>sergioluque.com</strong>, is operated by Sergio Luque,
        composer and researcher (the <em>data controller</em> for the purposes
        of the EU General Data Protection Regulation, Regulation (EU) 2016/679
        — hereafter the <strong>GDPR</strong>).
      </p>
      <p style={p}>
        For any privacy-related question, exercise of rights, or to withdraw a
        consent you have given, write to{' '}
        <a
          href={`mailto:${CONTROLLER_EMAIL}`}
          style={{ color: 'var(--accent)', textDecoration: 'underline' }}
        >
          {CONTROLLER_EMAIL}
        </a>
        .
      </p>

      <h2 style={h2}>2. Personal data we process</h2>

      <h3 style={h3}>2.1 Contact form</h3>
      <p style={p}>
        When you fill in the form on the <Link href="/contact" style={{ color: 'var(--accent)' }}>contact</Link>{' '}
        page we process the name, email address, subject, and message you
        provide. The message is delivered to our inbox by{' '}
        <a
          href="https://resend.com/legal/privacy-policy"
          target="_blank"
          rel="noopener"
          style={{ color: 'var(--accent)' }}
        >
          Resend
        </a>{' '}
        (email delivery service) and is kept only as long as needed to reply
        to you and document the exchange.
      </p>
      <p style={p}>
        <strong>Legal basis (Art. 6 GDPR):</strong> consent — you choose to
        send the form — and our legitimate interest in answering the
        enquiries we receive (Art. 6(1)(a) and 6(1)(f) GDPR).
      </p>

      <h3 style={h3}>2.2 Site preferences (local storage)</h3>
      <p style={p}>
        Your theme choice (light or dark) and your cookie consent state are
        stored in your browser&rsquo;s local storage under the keys{' '}
        <code>sl-theme</code> and <code>sl-cookie-consent</code>. They never
        leave your device and are not personal data in the GDPR sense — they
        only describe how the interface should render for you.
      </p>

      <h3 style={h3}>2.3 Admin authentication (only for authorised users)</h3>
      <p style={p}>
        If you sign in to the admin section under <code>/admin</code> we set
        an authentication cookie (<code>sl_admin_jwt</code>). This applies
        only to the site operator and people they have explicitly granted
        access to. <strong>Legal basis:</strong> performance of a contract /
        pre-contractual measures (Art. 6(1)(b) GDPR).
      </p>

      <h3 style={h3}>2.4 Server access logs</h3>
      <p style={p}>
        Our hosting provider Cloudflare keeps short-lived technical logs of
        HTTP requests (IP, user agent, timestamps, paths). These are used
        only to keep the service running and to mitigate abuse. We do not
        access them to profile visitors. <strong>Legal basis:</strong>{' '}
        legitimate interest in operating and securing the site (Art. 6(1)(f)
        GDPR).
      </p>

      <h3 style={h3}>2.5 Analytics (optional, with your consent)</h3>
      <p style={p}>
        If you grant the <em>Analytics</em> consent in the cookie banner we
        load <strong>Google Analytics 4</strong> with{' '}
        <a
          href="https://support.google.com/analytics/answer/9976101"
          target="_blank"
          rel="noopener"
          style={{ color: 'var(--accent)' }}
        >
          Consent Mode v2
        </a>
        , <code>anonymize_ip</code> enabled, and ad signals turned off. We
        use it to understand which works and pages are visited; we do not
        build individual profiles, do not run advertising, and do not sell
        any data.
      </p>
      <p style={p}>
        Until you grant consent, GA4 sends only anonymous, cookieless pings
        (or no pings at all) and no analytics cookies are set on your
        browser. You can change your choice at any time from the{' '}
        <CookiePreferencesLink /> link in the footer.
      </p>
      <p style={p}>
        <strong>Legal basis:</strong> your consent (Art. 6(1)(a) GDPR and
        Art. 5(3) ePrivacy Directive).
      </p>

      <h2 style={h2}>3. Categories of recipients (sub-processors)</h2>
      <p style={p}>
        We use a small number of vetted service providers to run the site.
        They process data only on our instructions, under data-processing
        agreements aligned with Art. 28 GDPR.
      </p>
      <ul style={ul}>
        <li>
          <strong>Cloudflare, Inc.</strong> — hosting (Pages), edge compute
          (Workers), object storage (R2), database (D1).{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener"
            style={{ color: 'var(--accent)' }}
          >
            Privacy policy
          </a>
          .
        </li>
        <li>
          <strong>Resend</strong> — transactional email delivery for the
          contact form.{' '}
          <a
            href="https://resend.com/legal/privacy-policy"
            target="_blank"
            rel="noopener"
            style={{ color: 'var(--accent)' }}
          >
            Privacy policy
          </a>
          .
        </li>
        <li>
          <strong>Google Ireland Limited</strong> — Google Analytics 4
          (loaded only if you grant the analytics consent).{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener"
            style={{ color: 'var(--accent)' }}
          >
            Privacy policy
          </a>
          .
        </li>
      </ul>

      <h2 style={h2}>4. International transfers</h2>
      <p style={p}>
        Cloudflare and Google are US-headquartered companies. Where personal
        data flows outside the European Economic Area, those transfers are
        covered by the European Commission&rsquo;s{' '}
        <a
          href="https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en"
          target="_blank"
          rel="noopener"
          style={{ color: 'var(--accent)' }}
        >
          Standard Contractual Clauses
        </a>{' '}
        (Art. 46(2)(c) GDPR) and, where applicable, the{' '}
        <a
          href="https://www.dataprivacyframework.gov/"
          target="_blank"
          rel="noopener"
          style={{ color: 'var(--accent)' }}
        >
          EU–US Data Privacy Framework
        </a>{' '}
        (adequacy decision of 10 July 2023).
      </p>

      <h2 style={h2}>5. Retention</h2>
      <ul style={ul}>
        <li>Contact-form messages: kept while needed to reply, then archived or deleted.</li>
        <li>Server access logs at Cloudflare: retained per Cloudflare&rsquo;s standard policy (typically days to weeks).</li>
        <li>Analytics data in GA4 (with consent): retained according to the property setting (default 14 months, configurable).</li>
        <li>Local-storage values on your device: until you clear them or revoke consent.</li>
        <li>Admin authentication cookie: until logout or expiry (24h by default).</li>
      </ul>

      <h2 style={h2}>6. Your rights under the GDPR</h2>
      <p style={p}>You have the right, at any time and free of charge, to:</p>
      <ul style={ul}>
        <li><strong>Access</strong> — request confirmation and a copy of the personal data we hold about you (Art. 15).</li>
        <li><strong>Rectification</strong> — ask us to correct inaccurate or incomplete data (Art. 16).</li>
        <li><strong>Erasure</strong> — ask us to delete data that is no longer needed or that you have withdrawn consent for (Art. 17).</li>
        <li><strong>Restriction</strong> — ask us to limit processing in specific circumstances (Art. 18).</li>
        <li><strong>Portability</strong> — receive your data in a structured, commonly-used, machine-readable format (Art. 20).</li>
        <li><strong>Objection</strong> — object to processing based on legitimate interest (Art. 21).</li>
        <li><strong>Withdraw consent</strong> at any time, without affecting the lawfulness of processing carried out before withdrawal.</li>
        <li><strong>Lodge a complaint</strong> with the data-protection supervisory authority of your EU member state (e.g. the AEPD in Spain, the CNIL in France, the DPC in Ireland). A list is available at{' '}
          <a
            href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en"
            target="_blank"
            rel="noopener"
            style={{ color: 'var(--accent)' }}
          >
            edpb.europa.eu
          </a>
          .
        </li>
      </ul>
      <p style={p}>
        To exercise any of these rights, write to{' '}
        <a
          href={`mailto:${CONTROLLER_EMAIL}`}
          style={{ color: 'var(--accent)', textDecoration: 'underline' }}
        >
          {CONTROLLER_EMAIL}
        </a>
        . We respond within one month (Art. 12(3) GDPR).
      </p>

      <h2 style={h2}>7. Cookies and similar technologies</h2>
      <p style={p}>
        The site uses very few cookies and a small amount of local storage.
        The breakdown:
      </p>
      <ul style={ul}>
        <li><strong>Strictly necessary</strong> — theme preference (<code>sl-theme</code>), cookie consent state (<code>sl-cookie-consent</code>), admin authentication (<code>sl_admin_jwt</code>, only set after sign-in). No consent required.</li>
        <li><strong>Analytics</strong> — Google Analytics 4 cookies (<code>_ga</code>, <code>_ga_*</code>). Loaded only if you grant the consent.</li>
        <li><strong>Marketing</strong> — none currently. Reserved for any future third-party embed (e.g. social sharing) so it loads only with consent.</li>
      </ul>
      <p style={p}>
        Manage your choice at any time via the <CookiePreferencesLink />{' '}
        link in the footer. Browser-level controls (delete cookies, block
        third-party cookies, &ldquo;Do Not Track&rdquo;) are also respected.
      </p>

      <h2 style={h2}>8. Children</h2>
      <p style={p}>
        The site is not directed to children under 16. We do not knowingly
        collect personal data from minors. If you believe a child has
        provided us with data, contact us and we will delete it.
      </p>

      <h2 style={h2}>9. Security</h2>
      <p style={p}>
        Communications with the site are encrypted in transit (HTTPS).
        Authentication uses signed JSON Web Tokens stored as HTTP-only
        cookies. The admin area is reachable only after a successful login.
      </p>

      <h2 style={h2}>10. Changes to this policy</h2>
      <p style={p}>
        We will update this page when our processing changes. The current
        version is dated above. For substantive changes affecting consent
        we will surface a fresh banner so you can review and re-confirm
        your choices.
      </p>

      <h2 style={h2}>11. Contact</h2>
      <p style={p}>
        Sergio Luque · data controller ·{' '}
        <a
          href={`mailto:${CONTROLLER_EMAIL}`}
          style={{ color: 'var(--accent)', textDecoration: 'underline' }}
        >
          {CONTROLLER_EMAIL}
        </a>
      </p>
    </div>
  )
}
