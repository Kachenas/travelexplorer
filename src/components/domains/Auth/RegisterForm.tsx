'use client'

import { useState } from 'react'
import { signUpAction } from '@/actions/auth-actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await signUpAction(formData)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
    }
    if (result?.success) {
      setSuccess(true)
      toast.success(result.success)
    }
    setPending(false)
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-ink text-base font-medium">Check your email</p>
        <p className="text-ink-secondary text-sm">
          We sent you a confirmation link. Click it to activate your account.
        </p>
        <Link
          href="/login"
          className="text-primary inline-block text-sm font-medium hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-ink-secondary block text-sm font-medium">Full Name</label>
        <input
          name="name"
          type="text"
          required
          placeholder="Your full name"
          className="border-border bg-surface text-ink placeholder:text-ink-faint focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-ink-secondary block text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          required
          className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-ink-secondary block text-sm font-medium">Password</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 pr-11 text-base transition-colors focus:ring-1 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-ink-secondary hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? 'Creating account...' : 'Create Account'}
      </Button>
      <p className="text-ink-secondary text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
