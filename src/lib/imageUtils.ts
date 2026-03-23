import { supabase } from './supabase'

export function getOptimizedImageUrl(path: string, width = 400): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(path, {
      transform: { width, quality: 75, format: 'origin' }
    })
  return data.publicUrl
}
