'use client'

import { useState } from 'react'
import { ImageUploader } from './ImageUploader'

interface FormImageUploaderProps {
  name?: string
  bucket: string
  maxFiles?: number
  defaultValue?: string[]
}

export function FormImageUploader({
  name = 'images',
  bucket,
  maxFiles = 5,
  defaultValue = [],
}: FormImageUploaderProps) {
  const [images, setImages] = useState<string[]>(defaultValue)

  return (
    <div className="space-y-1.5">
      <span className="text-ink-secondary block text-sm font-medium">Photos</span>
      <ImageUploader images={images} onUpload={setImages} bucket={bucket} maxFiles={maxFiles} />
      {images.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}
    </div>
  )
}
