'use client'

export function DeleteAuthorButton({ id }: { id: string }) {
  const onClick = async () => {
    if (!confirm('¿Eliminar autor y sus libros?')) return
    const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' })
    if (!res.ok) return alert('Error al eliminar autor')
    location.reload()
  }

  return (
    <button onClick={onClick} className="px-2 py-1 border rounded">
      Eliminar
    </button>
  )
}
