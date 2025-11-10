import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getAuthorId(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params
  const { id } = 'then' in p ? await (p as Promise<{ id: string }>) : (p as { id: string })
  return decodeURIComponent(id || '')
}

type Row = {
  title: string
  publishedYear: number | null
  pages: number | null
  genre: string | null
}

export async function GET(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const authorId = await getAuthorId(ctx)
  if (!authorId) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  try {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { id: true, name: true },
    })
    if (!author) return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })

    const books: Row[] = await prisma.book.findMany({
      where: { authorId },
      select: { title: true, publishedYear: true, pages: true, genre: true },
      orderBy: { publishedYear: 'asc' },
    })

    const totalBooks = books.length
    if (totalBooks === 0) {
      return NextResponse.json({
        authorId: author.id,
        authorName: author.name,
        totalBooks: 0,
        firstBook: null,
        latestBook: null,
        averagePages: 0,
        genres: [],
        longestBook: null,
        shortestBook: null,
      })
    }

    const first = books.find(b => b.publishedYear != null) || null
    const last  = [...books].reverse().find(b => b.publishedYear != null) || null

    const withPages = books.filter((b): b is Row & { pages: number } => typeof b.pages === 'number')
    const averagePages = withPages.length
      ? Math.round(withPages.reduce((a, b) => a + b.pages, 0) / withPages.length)
      : 0

    const genres = Array.from(new Set(books.map(b => b.genre).filter(Boolean) as string[]))

    const [longestRaw] = await prisma.book.findMany({
      where: { authorId, pages: { not: null } },
      orderBy: { pages: 'desc' },
      take: 1,
      select: { title: true, pages: true },
    })
    const [shortestRaw] = await prisma.book.findMany({
      where: { authorId, pages: { not: null } },
      orderBy: { pages: 'asc' },
      take: 1,
      select: { title: true, pages: true },
    })

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks,
      firstBook: first ? { title: first.title, year: first.publishedYear ?? null } : null,
      latestBook: last  ? { title: last.title,  year: last.publishedYear  ?? null } : null,
      averagePages,
      genres,
      longestBook: longestRaw ? { title: longestRaw.title, pages: longestRaw.pages! } : null,
      shortestBook: shortestRaw ? { title: shortestRaw.title, pages: shortestRaw.pages! } : null,
    })
  } catch (e) {
    console.error('GET /api/authors/[id]/stats', e, authorId)
    return NextResponse.json({ error: 'Error al obtener estadísticas de autor' }, { status: 500 })
  }
}
