import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import * as adminService from '@/services/AdminService'
import { AdminSidebar } from '@/components/domains/Admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin = await adminService.isAdmin(supabase, user.id)
  if (!isAdmin) redirect('/dashboard')

  const [pendingVehicles, pendingAccommodations, pendingTours] = await Promise.all([
    adminService.fetchPendingVehicles(supabase).catch(() => []),
    adminService.fetchPendingAccommodations(supabase).catch(() => []),
    adminService.fetchPendingTours(supabase).catch(() => []),
  ])

  const pendingCount = pendingVehicles.length + pendingAccommodations.length + pendingTours.length

  return (
    <div className="bg-page flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar userEmail={user.email ?? ''} pendingCount={pendingCount} />
      <main className="flex-1 px-6 py-10 lg:px-10">{children}</main>
    </div>
  )
}
