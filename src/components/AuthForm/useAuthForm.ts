'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const authSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type AuthFormData = z.infer<typeof authSchema>

interface UseAuthFormResult {
  form: ReturnType<typeof useForm<AuthFormData>>
  loading: boolean
  error: string | null
  handleSignIn: (data: AuthFormData) => Promise<void>
  handleSignUp: (data: AuthFormData) => Promise<void>
}

export function useAuthForm(): UseAuthFormResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const handleSignIn = async (data: AuthFormData) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    toast.success('Welcome back!', {
      description: 'You have successfully signed in.',
      duration: 3000
    })
    
    router.push('/dashboard')
    setLoading(false)
  }

  const handleSignUp = async (data: AuthFormData) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    toast.success('Check your email', {
      description: 'We sent you a confirmation link to activate your account.',
      duration: 5000
    })
    
    router.push('/login')
    setLoading(false)
  }

  return {
    form,
    loading,
    error,
    handleSignIn,
    handleSignUp
  }
} 