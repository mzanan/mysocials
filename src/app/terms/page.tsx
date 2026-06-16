import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms for using mySocials.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 15, 2026">
      <p>
        These terms govern your use of mySocials at links.itsmatias.com. By creating an account you
        agree to them.
      </p>

      <LegalSection title="The service">
        <p>
          mySocials lets you build a public link-in-bio page with your links, photos and videos, hosted
          at links.itsmatias.com/your-username.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>You are responsible for your account and for keeping your credentials secure.</p>
      </LegalSection>

      <LegalSection title="Subscription and billing">
        <p>
          Publishing your page requires an active subscription of $3/month, billed through Polar. It
          renews automatically until you cancel. You can cancel anytime and keep access until the end of
          the paid period. Partial periods are not refunded.
        </p>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          You own the content you add. You grant us a limited license to host and display it as part of
          your public page. You are responsible for having the rights to everything you upload or import
          from Instagram, and for not posting illegal or infringing content.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>No spam, abuse, malware or unlawful use. We may suspend pages that violate these terms.</p>
      </LegalSection>

      <LegalSection title="Instagram import">
        <p>
          Importing from Instagram is optional, requires a Professional (Business or Creator) account,
          and is subject to Meta&apos;s terms. You can disconnect at any time.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>You can delete your account anytime. We may terminate accounts that breach these terms.</p>
      </LegalSection>

      <LegalSection title="Disclaimer">
        <p>
          The service is provided &quot;as is&quot;. To the extent permitted by law, we are not liable
          for indirect or incidental damages arising from its use.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions:{' '}
          <a className="text-accent underline-offset-4 hover:underline" href="mailto:hello@itsmatias.com">
            hello@itsmatias.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
