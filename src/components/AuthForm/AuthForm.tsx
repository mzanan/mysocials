'use client'

import Link from 'next/link'
import { useAuthForm } from './useAuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput, FormButton } from '@/components/styles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface AuthFormProps {
  initialMode?: 'signin' | 'signup'
}

export function AuthForm({ initialMode = 'signin' }: AuthFormProps) {
  const { form, loading, error, handleSignIn, handleSignUp } = useAuthForm()

  const onSubmit = async (data: { email: string; password: string }) => {
    if (initialMode === 'signin') {
      await handleSignIn(data)
    } else {
      await handleSignUp(data)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{initialMode === 'signin' ? 'Sign In' : 'Sign Up'}</CardTitle>
        <CardDescription>
          {initialMode === 'signin' 
            ? 'Enter your credentials to access' 
            : 'Create an account to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <FormButton type="submit" loading={loading} loadingText="Loading...">
              {initialMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </FormButton>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Button asChild variant="link">
            <Link href={initialMode === 'signin' ? '/signup' : '/login'}>
              {initialMode === 'signin' 
                ? "Don\'t have an account? Sign up"
                : 'Already have an account? Sign in'
              }
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 