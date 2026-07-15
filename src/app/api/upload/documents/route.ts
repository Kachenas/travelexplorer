import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB per file

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const formData = await request.formData()

  const fields = ['identification', 'business_permit', 'document'] as const
  const updates: Record<string, string> = {}

  for (const field of fields) {
    const file = formData.get(field)
    if (!file || !(file instanceof File) || file.size === 0) continue

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `${field}: only JPG, JPEG, and PNG images are accepted` },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `${field}: file exceeds 10 MB limit` },
        { status: 400 },
      )
    }

    const buffer = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`
    updates[field] = base64
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any)
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
