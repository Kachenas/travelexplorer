'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUpAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string | undefined

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: name ? { full_name: name } : undefined },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Check your email for a confirmation link' }
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', data.user.id)
    .single()

  redirect(profile?.user_type === 'admin' ? '/admin' : '/dashboard')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password reset email sent' }
}
