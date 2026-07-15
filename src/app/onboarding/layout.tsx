import Link from 'next/link'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-page flex min-h-screen flex-col">
      <header className="border-border border-b px-6 py-4">
        <Link
          href="/"
          className="text-ink font-[family-name:var(--font-display)] text-xl font-bold tracking-tight"
        >
          Luzon Explore
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 py-16">{children}</main>
    </div>
  )
}
