import Link from 'next/link'
import { getBaseUrl } from '@/lib/base-url'
import { EditAuthorForm } from '@/app/components/EditAuthorForm'

async function fetchJson<T>(path: string) {
  const base = await getBaseUrl()
  const res = await fetch(`${base}${path}`, { cache: 'no-store' })
  return { ok: res.ok, status: res.status, data: res.ok ? ((await res.json()) as T) : null }
}

export default async function AuthorDetail(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const safeId = decodeURIComponent(id)

  const [authorRes, statsRes, booksRes] = await Promise.all([
    fetchJson<any>(`/api/authors/${encodeURIComponent(safeId)}`),
    fetchJson<any>(`/api/authors/${encodeURIComponent(safeId)}/stats`),
    fetchJson<any>(`/api/authors/${encodeURIComponent(safeId)}/books`),
  ])

  if (!authorRes.ok) {
    return (
      <main className="p-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Autor</h1>
        <div className="rounded-lg border p-4 bg-black/10">
          <p className="text-red-500 font-medium mb-2">
            {authorRes.status === 404 ? 'Autor no encontrado' : 'Error al cargar autor'}
          </p>
          <p className="text-sm text-gray-500">ID: {safeId}</p>
          <div className="mt-4">
            <Link href="/" className="px-3 py-1.5 border rounded">Volver al dashboard</Link>
          </div>
        </div>
      </main>
    )
  }

  const author = authorRes.data!
  const stats  = statsRes.ok ? statsRes.data : { totalBooks:0, firstBook:null, latestBook:null, averagePages:0, genres:[], longestBook:null, shortestBook:null }
  const booksData = booksRes.ok ? booksRes.data : { books: [] }

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{author.name}</h1>
        <div className="flex gap-2">
          <Link href="/books" className="px-3 py-1.5 border rounded">Buscar Libros</Link>
          <Link href={`/books?authorId=${author.id}#crear`} className="px-3 py-1.5 border rounded">Agregar libro</Link>
        </div>
      </div>

      {/* Stats */}
      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-2">Estadísticas</h2>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="border rounded p-3">
            <div>Total libros: <b>{stats.totalBooks}</b></div>
            <div>Primer libro: <b>{stats.firstBook?.title ?? '—'}</b> ({stats.firstBook?.year ?? '—'})</div>
            <div>Último libro: <b>{stats.latestBook?.title ?? '—'}</b> ({stats.latestBook?.year ?? '—'})</div>
            <div>Promedio páginas: <b>{stats.averagePages}</b></div>
            <div>Géneros: <b>{stats.genres?.join(', ') || '—'}</b></div>
          </div>
          <div className="border rounded p-3">
            <div>Más páginas: <b>{stats.longestBook?.title ?? '—'}</b> ({stats.longestBook?.pages ?? '—'})</div>
            <div>Menos páginas: <b>{stats.shortestBook?.title ?? '—'}</b> ({stats.shortestBook?.pages ?? '—'})</div>
          </div>
        </div>
      </section>

      {/* Libros */}
      <section className="rounded-xl border p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Libros de {author.name}</h2>
          <Link href={`/books?authorId=${author.id}`} className="px-3 py-1.5 border rounded">
            Buscar libros de este autor
          </Link>
        </div>
        <ul className="grid md:grid-cols-2 gap-3">
          {booksData.books?.map((b: any) => (
            <li key={b.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{b.title}</div>
                <div className="text-xs text-gray-500">{b.publishedYear ?? '—'}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Editar autor (client component importado) */}
      <EditAuthorForm author={author} />
    </main>
  )
}
