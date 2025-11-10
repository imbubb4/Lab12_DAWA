// app/authors/new/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NewAuthorPage() {
  const [form, setForm] = useState({
    name: '', email: '', bio: '', nationality: '', birthYear: ''
  })
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/authors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        birthYear: form.birthYear ? Number(form.birthYear) : null,
      }),
    })
    setSaving(false)
    if (!res.ok) return alert('Error al crear autor')
    const created = await res.json()
    window.location.href = `/authors/${created.id}`
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Crear autor</h1>
        <Link href="/" className="px-3 py-1.5 border rounded">Volver</Link>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded px-3 py-2" placeholder="Nombre" required
          value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="border rounded px-3 py-2" placeholder="Email"
          value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="border rounded px-3 py-2" placeholder="Nacionalidad"
          value={form.nationality} onChange={e=>setForm({...form, nationality:e.target.value})}/>
        <input className="border rounded px-3 py-2" placeholder="Año de nacimiento" type="number"
          value={form.birthYear} onChange={e=>setForm({...form, birthYear:e.target.value})}/>
        <textarea className="border rounded px-3 py-2" placeholder="Bio"
          value={form.bio} onChange={e=>setForm({...form, bio:e.target.value})}/>
        <button disabled={saving} className="border rounded px-3 py-2">
          {saving ? 'Creando…' : 'Crear autor'}
        </button>
      </form>
    </main>
  )
}
