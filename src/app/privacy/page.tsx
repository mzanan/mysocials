import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How mySocials collects, uses and protects your data.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 15, 2026">
      <p>
        mySocials (&quot;we&quot;, &quot;us&quot;) is a link-in-bio service operated by Matias Zanan at
        links.itsmatias.com. This policy explains what we collect, why, and the choices you have.
      </p>

      <LegalSection title="Information we collect">
        <p>
          <strong className="text-fg">Account.</strong> Your email, display name and a hashed password
          (or a Google sign-in identifier).
        </p>
        <p>
          <strong className="text-fg">Profile content.</strong> The display name, bio, avatar, links and
          the photos or videos you upload to build your public page.
        </p>
        <p>
          <strong className="text-fg">Instagram.</strong> If you connect Instagram, we access your
          profile and the media you choose to import, using an access token we store on your behalf.
        </p>
        <p>
          <strong className="text-fg">Payments.</strong> Billing is handled by Polar. We store your
          subscription status and customer id, never your card details.
        </p>
      </LegalSection>

      <LegalSection title="How we use it">
        <p>
          To run the service: create your account, render your public page, process your subscription
          and send essential account emails. We do not sell your data or use it for advertising.
        </p>
      </LegalSection>

      <LegalSection title="Processors we share with">
        <p>
          Turso (database), Cloudflare R2 (media storage), Polar (payments), Meta/Instagram (import you
          initiate) and our email provider. Each only receives what is needed to provide its function.
        </p>
      </LegalSection>

      <LegalSection id="data-deletion" title="Data retention and deletion">
        <p>
          You can delete your content at any time from your dashboard, and request full account deletion
          by emailing{' '}
          <a className="text-accent underline-offset-4 hover:underline" href="mailto:hello@itsmatias.com">
            hello@itsmatias.com
          </a>
          . On deletion we remove your profile, uploaded media and any stored Instagram token within 30
          days. See our{' '}
          <Link className="text-accent underline-offset-4 hover:underline" href="/data-deletion">
            data deletion instructions
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>You can access, correct or delete your personal data at any time. Contact us for any request.</p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>We use a single session cookie to keep you signed in. No third-party advertising cookies.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy:{' '}
          <a className="text-accent underline-offset-4 hover:underline" href="mailto:hello@itsmatias.com">
            hello@itsmatias.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
