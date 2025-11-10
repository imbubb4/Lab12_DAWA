// src/lib/base-url.ts
import { headers } from 'next/headers'

export async function getBaseUrl() {
  const h = await headers() // 👈 aquí el await
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto =
    h.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'production' ? 'https' : 'http')

  if (host) return `${proto}://${host}`

  return process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
}
