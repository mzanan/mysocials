import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Data Deletion',
  description: 'How to delete your data from mySocials.',
}

export default function DataDeletionPage() {
  return (
    <LegalPage title="Data Deletion" updated="June 15, 2026">
      <p>You can remove your data from mySocials at any time. Here is how.</p>

      <LegalSection title="Delete specific content">
        <p>
          From your dashboard you can delete any photo, video or link, and unpublish your page so it is
          no longer public.
        </p>
      </LegalSection>

      <LegalSection title="Disconnect Instagram">
        <p>
          Disconnecting Instagram removes the access token we stored. You can also revoke access from
          Instagram under Settings, Apps and websites.
        </p>
      </LegalSection>

      <LegalSection title="Delete your account">
        <p>
          To delete your entire account and all associated data, email{' '}
          <a className="text-accent underline-offset-4 hover:underline" href="mailto:hello@itsmatias.com">
            hello@itsmatias.com
          </a>{' '}
          from your account email. We remove your profile, uploaded media and any stored Instagram token
          within 30 days.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
