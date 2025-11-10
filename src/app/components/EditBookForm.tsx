'use client'
import * as React from 'react'

export function EditBookForm({ book, authors }: { book: any; authors: any[] }) {
  const [form, setForm] = React.useState({
    title: book.title ?? '',
    description: book.description ?? '',
    isbn: book.isbn ?? '',
    publishedYear: book.publishedYear ?? '',
    genre: book.genre ?? '',
    pages: book.pages ?? '',
    authorId: book.authorId ?? (authors[0]?.id ?? ''),
  })
  const [saving, setSaving] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
        pages: form.pages ? Number(form.pages) : undefined,
      }),
    })
    setSaving(false)
    if (!res.ok) return alert('Error al actualizar libro')
    alert('Libro actualizado')
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label htmlFor="b-title" className="sr-only">Título</label>
      <input id="b-title" className="border rounded px-3 py-2" placeholder="Título" required
        value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>

      <label htmlFor="b-description" className="sr-only">Descripción</label>
      <input id="b-description" className="border rounded px-3 py-2" placeholder="Descripción"
        value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>

      <label htmlFor="b-isbn" className="sr-only">ISBN</label>
      <input id="b-isbn" className="border rounded px-3 py-2" placeholder="ISBN" required
        value={form.isbn} onChange={e=>setForm({...form, isbn:e.target.value})}/>

      <label htmlFor="b-year" className="sr-only">Año de publicación</label>
      <input id="b-year" className="border rounded px-3 py-2" placeholder="Año" type="number"
        value={form.publishedYear ?? ''} onChange={e=>setForm({...form, publishedYear:e.target.value})}/>

      <label htmlFor="b-genre" className="sr-only">Género</label>
      <input id="b-genre" className="border rounded px-3 py-2" placeholder="Género"
        value={form.genre ?? ''} onChange={e=>setForm({...form, genre:e.target.value})}/>

      <label htmlFor="b-pages" className="sr-only">Páginas</label>
      <input id="b-pages" className="border rounded px-3 py-2" placeholder="Páginas" type="number"
        value={form.pages ?? ''} onChange={e=>setForm({...form, pages:e.target.value})}/>

      <label htmlFor="b-authorId" className="sr-only">Autor</label>
      <select id="b-authorId" className="border rounded px-3 py-2"
        value={form.authorId} onChange={e=>setForm({...form, authorId:e.target.value})}>
        {authors.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      <button disabled={saving} className="border rounded px-3 py-2">
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}
