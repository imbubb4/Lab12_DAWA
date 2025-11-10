// app/books/page.tsx
'use client'

import { useEffect, useState, type ChangeEvent } from 'react'

type Author = { id: string; name: string }
type Book = {
  id: string
  title: string
  publishedYear?: number | null
  genre?: string | null
  createdAt: string
  author: Author
}

export default function BooksPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<string[]>([])

  // filtros
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt'|'title'|'publishedYear'>('createdAt')
  const [order, setOrder] = useState<'asc'|'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{data:Book[],pagination:any}>({
    data:[],
    pagination:{page:1,limit:10,total:0,totalPages:1}
  })

  // crear libro
  const [form, setForm] = useState({
    title:'', description:'', isbn:'', publishedYear:'', genre:'', pages:'', authorId:''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/authors').then(r=>r.json()).then((list) => {
      setAuthors(list)
      setForm(f => ({...f, authorId: list[0]?.id ?? ''}))
    })
    fetch('/api/books?limit=200').then(r=>r.json()).then((books) => {
      const gs = Array.from(new Set((books as any[]).map(b => b.genre).filter(Boolean)))
      setGenres(gs)
    })
  }, [])

  // búsqueda (debounce)
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      if (genre) params.set('genre', genre)
      if (authorId) {
        const a = authors.find(a => a.id === authorId)
        if (a) params.set('authorName', a.name)
      }
      params.set('page', String(page))
      params.set('limit', String(limit))
      params.set('sortBy', sortBy)
      params.set('order', order)
      const res = await fetch(`/api/books/search?` + params.toString(), { cache: 'no-store' })
      const json = await res.json()
      setData(json)
      setLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [q, genre, authorId, sortBy, order, page, limit, authors])

  const canPrev = data.pagination?.hasPrev
  const canNext = data.pagination?.hasNext

  // crear libro
  async function createBook(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
        pages: form.pages ? Number(form.pages) : null,
      }),
    })
    setCreating(false)
    if (res.ok) {
      setForm({ title:'', description:'', isbn:'', publishedYear:'', genre:'', pages:'', authorId: authors[0]?.id ?? '' })
      setPage(1)
      setQ('')
    } else {
      alert('Error al crear libro')
    }
  }

  async function deleteBook(id: string) {
    if (!confirm('¿Eliminar libro?')) return
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setData(d => ({...d, data: d.data.filter(b => b.id !== id)}))
    } else {
      alert('Error al eliminar')
    }
  }

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Libros</h1>

      {/* Crear libro */}
      <section id="crear" className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Crear libro</h2>
        <form onSubmit={createBook} className="grid md:grid-cols-3 gap-3">
          <label htmlFor="c-title" className="sr-only">Título</label>
          <input id="c-title" className="border rounded px-3 py-2" placeholder="Título" required
            value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>

          <label htmlFor="c-description" className="sr-only">Descripción</label>
          <input id="c-description" className="border rounded px-3 py-2 md:col-span-2" placeholder="Descripción"
            value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>

          <label htmlFor="c-isbn" className="sr-only">ISBN</label>
          <input id="c-isbn" className="border rounded px-3 py-2" placeholder="ISBN" required
            value={form.isbn} onChange={e=>setForm({...form, isbn:e.target.value})}/>

          <label htmlFor="c-year" className="sr-only">Año de publicación</label>
          <input id="c-year" className="border rounded px-3 py-2" placeholder="Año" type="number"
            value={form.publishedYear} onChange={e=>setForm({...form, publishedYear:e.target.value})}/>

          <label htmlFor="c-genre" className="sr-only">Género</label>
          <input id="c-genre" className="border rounded px-3 py-2" placeholder="Género"
            value={form.genre} onChange={e=>setForm({...form, genre:e.target.value})}/>

          <label htmlFor="c-pages" className="sr-only">Páginas</label>
          <input id="c-pages" className="border rounded px-3 py-2" placeholder="Páginas" type="number"
            value={form.pages} onChange={e=>setForm({...form, pages:e.target.value})}/>

          <label htmlFor="c-authorId" className="sr-only">Autor</label>
          <select
            id="c-authorId"
            className="border rounded px-3 py-2"
            value={form.authorId}
            onChange={e=>setForm({...form, authorId:e.target.value})}
          >
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <button disabled={creating} className="border rounded px-3 py-2">
            {creating ? 'Creando…' : 'Crear'}
          </button>
        </form>
      </section>

      {/* Filtros */}
      <section className="space-y-3">
        <div className="grid md:grid-cols-4 gap-3">
          <label htmlFor="f-q" className="sr-only">Buscar por título</label>
          <input
            id="f-q"
            className="border rounded px-3 py-2"
            placeholder="Buscar por título..."
            value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>)=>{setPage(1); setQ(e.target.value)}}
          />

          <div>
            <label htmlFor="f-genre" className="sr-only">Filtrar por género</label>
            <select
              id="f-genre"
              className="border rounded px-3 py-2 w-full"
              value={genre}
              onChange={(e: ChangeEvent<HTMLSelectElement>)=>{setPage(1); setGenre(e.target.value)}}
            >
              <option value="">Todos los géneros</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="f-author" className="sr-only">Filtrar por autor</label>
            <select
              id="f-author"
              className="border rounded px-3 py-2 w-full"
              value={authorId}
              onChange={(e: ChangeEvent<HTMLSelectElement>)=>{setPage(1); setAuthorId(e.target.value)}}
            >
              <option value="">Todos los autores</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="f-sortBy" className="sr-only">Ordenar por</label>
              <select
                id="f-sortBy"
                className="border rounded px-3 py-2 w-full"
                value={sortBy}
                onChange={(e: ChangeEvent<HTMLSelectElement>)=>setSortBy(e.target.value as 'createdAt'|'title'|'publishedYear')}
              >
                <option value="createdAt">Fecha creación</option>
                <option value="title">Título</option>
                <option value="publishedYear">Año</option>
              </select>
            </div>

            <div>
              <label htmlFor="f-order" className="sr-only">Orden</label>
              <select
                id="f-order"
                className="border rounded px-3 py-2"
                value={order}
                onChange={(e: ChangeEvent<HTMLSelectElement>)=>setOrder(e.target.value as 'asc'|'desc')}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {loading ? 'Buscando...' : `Total: ${data.pagination?.total ?? 0}`}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={!canPrev} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
            <span className="text-sm">Página {data.pagination?.page ?? 1} / {data.pagination?.totalPages ?? 1}</span>
            <button className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={!canNext} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <ul className="grid md:grid-cols-2 gap-3">
        {data.data?.map((b: Book) => (
          <li key={b.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{b.title}</h3>
              <span className="text-xs text-gray-500">{b.publishedYear ?? '—'}</span>
            </div>
            <p className="text-sm text-gray-700">Autor: {b.author?.name}</p>
            <div className="mt-2 flex gap-2">
              <a className="px-2 py-1 border rounded" href={`/books/${b.id}`}>Ver</a>
              <a className="px-2 py-1 border rounded" href={`/books/${b.id}?edit=1`}>Editar</a>
              <button className="px-2 py-1 border rounded" onClick={()=>deleteBook(b.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
