import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import * as profileService from '@/services/ProfileService'
import { OnboardingWizard } from '@/components/domains/Onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await profileService.fetchProfile(supabase, user.id)

  if (profile && profile.user_type !== 'customer') {
    redirect('/dashboard')
  }

  return (
    <div className="w-full max-w-2xl">
      <OnboardingWizard fullName={profile?.full_name ?? ''} />
    </div>
  )
}
