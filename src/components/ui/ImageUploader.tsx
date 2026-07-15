'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/utils/cn'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ImageUploaderProps {
  images: string[]
  onUpload: (urls: string[]) => void
  maxFiles?: number
  bucket: string
}

export function ImageUploader({ images, onUpload, maxFiles = 5, bucket }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remaining = maxFiles - images.length
      if (remaining <= 0) {
        toast.error(`Maximum of ${maxFiles} images allowed`)
        return
      }

      const toUpload = fileArray.slice(0, remaining)
      setIsUploading(true)

      try {
        const supabase = createClient()
        const urls: string[] = []

        for (const file of toUpload) {
          const ext = file.name.split('.').pop()
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

          const { error } = await supabase.storage.from(bucket).upload(path, file)

          if (error) {
            toast.error(`Failed to upload ${file.name}`)
            continue
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(path)

          urls.push(publicUrl)
        }

        if (urls.length > 0) {
          onUpload([...images, ...urls])
        }
      } catch {
        toast.error('Upload failed')
      } finally {
        setIsUploading(false)
      }
    },
    [bucket, images, maxFiles, onUpload],
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index)
    onUpload(updated)
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              className="group relative h-20 w-20 overflow-hidden rounded-[var(--radius-badge)]"
            >
              <img src={url} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="bg-overlay absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
              >
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxFiles && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border-2 border-dashed px-6 py-8 transition-colors',
            isDragging
              ? 'border-primary bg-primary-light'
              : 'border-border hover:border-border-strong',
            isUploading && 'pointer-events-none opacity-40',
          )}
        >
          <PhotoIcon className="text-ink-faint mb-2 h-8 w-8" />
          <p className="text-ink-secondary text-sm font-medium">
            {isUploading ? 'Uploading...' : 'Drop images here or click to browse'}
          </p>
          <p className="text-ink-tertiary mt-1 text-xs">
            {images.length}/{maxFiles} images
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
