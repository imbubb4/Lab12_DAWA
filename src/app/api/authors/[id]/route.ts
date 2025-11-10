import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Extrae y normaliza el id soportando params como objeto o Promise (Next 16) */
async function getAuthorId(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params
  const { id } = 'then' in p ? await (p as Promise<{ id: string }>) : (p as { id: string })
  return decodeURIComponent(id || '')
}

// ───────────────────────────── GET /api/authors/:id
export async function GET(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const authorId = await getAuthorId(ctx)
  if (!authorId) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  try {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: {
        books: { orderBy: { publishedYear: 'desc' } },
        _count: { select: { books: true } },
      },
    })
    if (!author) return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    return NextResponse.json(author)
  } catch (e) {
    console.error('GET /api/authors/[id]', e, authorId)
    return NextResponse.json({ error: 'Error al obtener autor' }, { status: 500 })
  }
}

// ───────────────────────────── PUT /api/authors/:id
export async function PUT(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const authorId = await getAuthorId(ctx)
  if (!authorId) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  try {
    const body = await req.json()
    const { name, email, bio, nationality, birthYear } = body as {
      name?: string
      email?: string
      bio?: string
      nationality?: string
      birthYear?: number | string | null
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
      }
    }

    let birthYearNormalized: number | null = null
    if (birthYear !== undefined && birthYear !== null && birthYear !== '') {
      const n = typeof birthYear === 'number' ? birthYear : parseInt(String(birthYear), 10)
      birthYearNormalized = Number.isFinite(n) ? n : null
    }

    const author = await prisma.author.update({
      where: { id: authorId },
      data: {
        name,
        email,
        bio,
        nationality,
        birthYear: birthYearNormalized,
      },
      include: {
        books: true,
        _count: { select: { books: true } },
      },
    })

    return NextResponse.json(author)
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    if (e?.code === 'P2002') return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    console.error('PUT /api/authors/[id]', e, authorId)
    return NextResponse.json({ error: 'Error al actualizar autor' }, { status: 500 })
  }
}

// ───────────────────────────── DELETE /api/authors/:id
export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const authorId = await getAuthorId(ctx)
  if (!authorId) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  try {
    await prisma.author.delete({ where: { id: authorId } })
    return NextResponse.json({ message: 'Autor eliminado correctamente' })
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    console.error('DELETE /api/authors/[id]', e, authorId)
    return NextResponse.json({ error: 'Error al eliminar autor' }, { status: 500 })
  }
}
