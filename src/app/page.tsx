import Link from 'next/link'
import { getBaseUrl } from '@/lib/base-url'
import { DeleteAuthorButton } from '@/app/components/DeleteAuthorButton'

async function getAuthors() {
  const base = await getBaseUrl()
  const res = await fetch(`${base}/api/authors`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function Dashboard() {
  const authors = await getAuthors()

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Biblioteca — Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/authors/new" className="px-3 py-2 rounded-md border">Crear Autor</Link>
          <Link href="/books" className="px-3 py-2 rounded-md border">Buscar Libros</Link>
        </div>
      </header>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Autores</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {authors.map((a: any) => (
            <article key={a.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{a.name}</h3>
                <div className="text-xs text-gray-500">Libros: {a._count?.books ?? 0}</div>
              </div>
              <p className="text-sm text-gray-700">{a.email}</p>
              <div className="mt-3 flex gap-2">
                <Link href={`/authors/${a.id}`} className="px-2 py-1 border rounded">Ver detalle</Link>
                <Link href={`/authors/${a.id}?edit=1`} className="px-2 py-1 border rounded">Editar</Link>
                <Link href={`/books?authorId=${a.id}`} className="px-2 py-1 border rounded">Libros</Link>
                <DeleteAuthorButton id={a.id} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-2">Estadísticas generales</h2>
        <ul className="text-sm list-disc pl-5 space-y-1">
          <li>Total de autores: {authors.length}</li>
        </ul>
      </section>
    </main>
  )
}
