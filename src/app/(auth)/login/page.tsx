import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { googleAuthEnabled } from '@/lib/auth'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return <AuthForm mode="login" googleEnabled={googleAuthEnabled} />
}
