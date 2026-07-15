const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png']

export function isValidImageFile(file: File): boolean {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  return ALLOWED_EXTENSIONS.includes(extension) && ALLOWED_MIME_TYPES.includes(file.type)
}
