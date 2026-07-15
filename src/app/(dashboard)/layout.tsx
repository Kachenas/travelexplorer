import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import * as profileService from '@/services/ProfileService'
import { DashboardSidebar } from '@/components/domains/Dashboard/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await profileService.fetchProfile(supabase, user.id)

  if (!profile || profile.user_type === 'customer') {
    redirect('/onboarding')
  }

  return (
    <div className="bg-page flex min-h-screen flex-col lg:flex-row">
      <DashboardSidebar userEmail={user.email ?? ''} userType={profile.user_type} />
      <main className="flex-1 px-6 py-10 lg:px-10">{children}</main>
    </div>
  )
}
