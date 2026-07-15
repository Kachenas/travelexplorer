'use client'

import { useState } from 'react'
import { signInAction } from '@/actions/auth-actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await signInAction(formData)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
    }
    setPending(false)
  }

  return (
    <form action={handleSubmit} className="space-y-5">
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
        {pending ? 'Signing in...' : 'Sign In'}
      </Button>
      <p className="text-ink-secondary text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
