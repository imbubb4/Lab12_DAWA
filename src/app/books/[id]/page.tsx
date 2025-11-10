import { getBaseUrl } from '@/lib/base-url'
import Link from 'next/link'
import { EditBookForm } from '@/app/components/EditBookForm'

async function getBook(id: string) {
  const base = await getBaseUrl()
  const res = await fetch(`${base}/api/books/${encodeURIComponent(id)}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}
async function getAuthors() {
  const base = await getBaseUrl()
  const res = await fetch(`${base}/api/authors`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await getBook(id)
  const authors = await getAuthors()

  if (!book) {
    return (
      <main className="p-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Libro</h1>
        <div className="rounded-lg border p-4 bg-black/10">
          <p className="text-red-500 font-medium mb-2">Libro no encontrado</p>
          <p className="text-sm text-gray-500">ID: {id}</p>
          <div className="mt-4">
            <Link href="/books" className="px-3 py-1.5 border rounded">Volver</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{book.title}</h1>
        <Link href="/books" className="px-3 py-1.5 border rounded">Volver</Link>
      </div>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-2">Editar libro</h2>
        <EditBookForm book={book} authors={authors} />
      </section>
    </main>
  )
}
