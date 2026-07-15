import { LoginForm } from '@/components/domains/Auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="bg-page flex min-h-screen items-center justify-center">
      <div className="bg-surface shadow-float w-full max-w-sm space-y-6 rounded-[var(--radius-card)] p-8">
        <div className="text-center">
          <h1 className="text-ink font-[family-name:var(--font-display)] text-3xl font-bold">
            Welcome Back
          </h1>
          <p className="text-ink-secondary mt-2 text-sm">Sign in to your Luzon Explore account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
