# Skill: Supabase Storage (Next.js)

## Overview

File uploads use Supabase Storage. In Next.js, uploads can go through **Server Actions** (recommended for mutations) or directly from the **browser client** in Client Components. Services accept a `SupabaseClient` parameter.

## Storage Service

```ts
// src/services/StorageService.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const DEFAULT_BUCKET = 'uploads'

export async function uploadFile(
  client: SupabaseClient<Database>,
  file: File,
  bucket: string = DEFAULT_BUCKET,
  path?: string,
): Promise<string> {
  const filePath = path || `${Date.now()}-${file.name}`

  const { error } = await client.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data: urlData } = client.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function uploadFileToUserFolder(
  client: SupabaseClient<Database>,
  file: File,
  userId: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<string> {
  const filePath = `${userId}/${Date.now()}-${file.name}`

  const { error } = await client.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data: urlData } = client.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function deleteFile(
  client: SupabaseClient<Database>,
  path: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<void> {
  const { error } = await client.storage
    .from(bucket)
    .remove([path])

  if (error) throw new Error(error.message)
}

export async function listFiles(
  client: SupabaseClient<Database>,
  folder: string,
  bucket: string = DEFAULT_BUCKET,
) {
  const { data, error } = await client.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) throw new Error(error.message)
  return data
}

export function getPublicUrl(
  client: SupabaseClient<Database>,
  path: string,
  bucket: string = DEFAULT_BUCKET,
): string {
  const { data } = client.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function getSignedUrl(
  client: SupabaseClient<Database>,
  path: string,
  expiresIn: number = 3600,
  bucket: string = DEFAULT_BUCKET,
): Promise<string> {
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) throw new Error(error.message)
  return data.signedUrl
}
```

## Upload via Server Action (Recommended)

```ts
// src/actions/upload-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadFileAction(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File

  if (!file) {
    return { error: 'No file provided' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const filePath = user
    ? `${user.id}/${Date.now()}-${file.name}`
    : `${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return { error: error.message }
  }

  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath)

  return { url: urlData.publicUrl }
}

export async function deleteFileAction(path: string) {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from('uploads')
    .remove([path])

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
```

## FileUploader Component

```tsx
// src/components/ui/FileUploader.tsx
'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'

interface FileUploaderProps {
  label?: string
  accept?: string
  maxSizeMb?: number
  onFileSelected: (file: File | null) => void
  className?: string
}

export function FileUploader({
  label = 'Upload file',
  accept = 'image/*',
  maxSizeMb = 5,
  onFileSelected,
  className,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File must be under ${maxSizeMb}MB`)
      return
    }

    setError(null)
    setFileName(file.name)

    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file))
    }

    onFileSelected(file)
  }

  function handleRemove() {
    setPreview(null)
    setFileName(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onFileSelected(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : fileName ? (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
          <span className="truncate text-sm text-gray-700">{fileName}</span>
          <button type="button" onClick={handleRemove}>
            <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
          Choose file
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

## Using FileUploader with Server Action

```tsx
'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/ui/FileUploader'
import { uploadFileAction } from '@/actions/upload-actions'
import { createProductAction } from '@/actions/product-actions'
import { toast } from 'sonner'

function ProductForm() {
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit() {
    try {
      setUploading(true)
      let imageUrl: string | undefined

      if (coverImage) {
        const formData = new FormData()
        formData.append('file', coverImage)
        const result = await uploadFileAction(formData)
        if ('error' in result) throw new Error(result.error)
        imageUrl = result.url
      }

      await createProductAction({
        title: '...',
        cover_image_url: imageUrl,
      })

      toast.success('Product created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
      <FileUploader
        label="Cover Image"
        accept="image/*"
        maxSizeMb={10}
        onFileSelected={setCoverImage}
      />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Create Product'}
      </button>
    </form>
  )
}
```

## Bucket Setup

Buckets must be created in the Supabase dashboard or via a migration:

```sql
-- Create a public bucket (files accessible without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true);

-- Create a private bucket (requires signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);
```

### Storage RLS Policies

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public read access for public bucket
CREATE POLICY "Public read for uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Image Display

```tsx
// Display uploaded image using public URL
<img
  src={product.cover_image_url}
  alt={product.title}
  className="h-48 w-full rounded-xl object-cover"
/>
```

For Next.js optimized images, use `next/image` with configured remote patterns:

```tsx
import Image from 'next/image'

<Image
  src={product.cover_image_url}
  alt={product.title}
  width={400}
  height={300}
  className="rounded-xl object-cover"
/>
```

Configure in `next.config.ts`:

```ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
```
