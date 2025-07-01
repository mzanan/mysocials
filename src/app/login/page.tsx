import { AuthForm } from '@/components/AuthForm/AuthForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm initialMode="signin" />
    </div>
  )
} 