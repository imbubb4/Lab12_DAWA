'use client'
import * as React from 'react'

export function EditAuthorForm({ author }: { author: any }) {
  const [form, setForm] = React.useState({
    name: author.name ?? '',
    email: author.email ?? '',
    bio: author.bio ?? '',
    nationality: author.nationality ?? '',
    birthYear: author.birthYear ?? '',
  })
  const [saving, setSaving] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/authors/${author.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        birthYear: form.birthYear ? Number(form.birthYear) : null,
      }),
    })
    setSaving(false)
    if (!res.ok) return alert('Error al actualizar autor')
    alert('Autor actualizado')
  }

  return (
    <section className="rounded-xl border p-4">
      <h2 className="font-medium mb-2">Editar autor</h2>
      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
        <label htmlFor="a-name" className="sr-only">Nombre</label>
        <input id="a-name" className="border rounded px-3 py-2" placeholder="Nombre" required
          value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <label htmlFor="a-email" className="sr-only">Email</label>
        <input id="a-email" className="border rounded px-3 py-2" placeholder="Email"
          value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <label htmlFor="a-bio" className="sr-only">Bio</label>
        <input id="a-bio" className="border rounded px-3 py-2 md:col-span-2" placeholder="Bio"
          value={form.bio} onChange={e=>setForm({...form, bio:e.target.value})}/>
        <label htmlFor="a-nat" className="sr-only">Nacionalidad</label>
        <input id="a-nat" className="border rounded px-3 py-2" placeholder="Nacionalidad"
          value={form.nationality} onChange={e=>setForm({...form, nationality:e.target.value})}/>
        <label htmlFor="a-year" className="sr-only">Año de nacimiento</label>
        <input id="a-year" className="border rounded px-3 py-2" placeholder="Año de nacimiento" type="number"
          value={form.birthYear ?? ''} onChange={e=>setForm({...form, birthYear:e.target.value})}/>
        <button disabled={saving} className="border rounded px-3 py-2">
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  )
}
