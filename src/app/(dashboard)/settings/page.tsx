import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import * as profileService from '@/services/ProfileService'
import { SettingsForm } from '@/components/domains/Settings/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await profileService.fetchProfile(supabase, user.id)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10">
        <p className="text-primary text-sm font-medium">Dashboard</p>
        <h1 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          Settings
        </h1>
        <p className="text-ink-secondary mt-2 text-base sm:text-lg">
          Manage your profile information
        </p>
      </div>

      <SettingsForm
        fullName={profile?.full_name ?? ''}
        nationality={profile?.nationality ?? ''}
        email={user.email ?? ''}
        userType={profile?.user_type ?? 'customer'}
      />
    </div>
  )
}
