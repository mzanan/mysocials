'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

const inputClasses =
  'w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 px-4 text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:bg-white/[0.08]'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
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
    <div className="relative w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl shadow-[0_24px_70px_-25px_rgba(0,0,0,0.8)]">
      <div className="absolute inset-0 rounded-3xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)]" />
      <div className="relative p-8">
        <h1 className="text-center text-[1.6rem] font-semibold tracking-tight text-white">
          {isSignup ? 'Create your page' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-center text-sm text-white/55">
          {isSignup ? 'Start building your link page' : 'Sign in to your dashboard'}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
          {isSignup && (
            <input
              type="text"
              autoComplete="name"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
            />
          )}
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
          <input
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />

          {error && <p className="text-sm text-red-300/90">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="link-btn mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.08] text-[15px] font-medium text-white transition hover:bg-white/[0.12] disabled:opacity-50"
          >
            {loading ? '…' : isSignup ? 'Sign up' : 'Sign in'}
          </button>
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
