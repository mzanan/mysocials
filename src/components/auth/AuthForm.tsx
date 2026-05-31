'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoogleSignInButton } from './GoogleSignInButton'

export function AuthForm({
  mode,
  googleEnabled = false,
}: {
  mode: 'login' | 'signup'
  googleEnabled?: boolean
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignup
      ? await authClient.signUp.email({ name: name || email.split('@')[0], email, password })
      : await authClient.signIn.email({ email, password })

    setLoading(false)
    if (error) {
      setError(error.message ?? 'Something went wrong')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="relative w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl shadow-glass-lg">
      <div className="absolute inset-0 rounded-3xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)]" />
      <div className="relative p-8">
        <h1 className="text-center text-[1.6rem] font-semibold tracking-tight text-white">
          {isSignup ? 'Create your page' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-center text-sm text-white/55">
          {isSignup ? 'Start building your link page' : 'Sign in to your dashboard'}
        </p>

        {googleEnabled && (
          <div className="mt-7">
            <GoogleSignInButton label={isSignup ? 'Sign up with Google' : 'Continue with Google'} />
            <div className="my-5 flex items-center gap-3 text-xs text-white/40">
              <span className="h-px flex-1 bg-white/10" />
              or
              <span className="h-px flex-1 bg-white/10" />
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`flex flex-col gap-3 ${googleEnabled ? '' : 'mt-7'}`}
        >
          {isSignup && (
            <Input
              type="text"
              autoComplete="name"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 px-4"
            />
          )}
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-4"
          />
          <Input
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 px-4"
          />

          {error && <p className="text-sm text-red-300/90">{error}</p>}

          <Button
            type="submit"
            variant="glass"
            disabled={loading}
            className="link-btn mt-2 h-11 w-full rounded-xl text-[15px]"
          >
            {loading ? '…' : isSignup ? 'Sign up' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <Link
            href={isSignup ? '/login' : '/signup'}
            className="text-white/80 underline-offset-4 hover:underline"
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  )
}
