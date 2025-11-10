import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Libros de un autor (por ID de autor)
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  try {
    const author = await prisma.author.findUnique({ where: { id } })
    if (!author) return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })

    const books = await prisma.book.findMany({
      where: { authorId: id },
      orderBy: { publishedYear: 'desc' },
    })

    return NextResponse.json({
      author: { id: author.id, name: author.name },
      totalBooks: books.length,
      books,
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener libros del autor' }, { status: 500 })
  }
}
