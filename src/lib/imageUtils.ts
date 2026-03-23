import { supabase } from './supabase'

export function getOptimizedImageUrl(url: string, width = 400): string {
  if (!url) return ''


  if (url.includes('supabase.co/storage/v1/object/public/')) {
    return url
      .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
      + `?width=${width}&quality=75&format=webp`
  }


  return url
}

export async function compressImage(file: File, maxWidth = 800, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }
    }
  })
}
