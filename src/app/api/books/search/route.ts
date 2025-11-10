import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SORT_MAP: Record<string, 'title' | 'publishedYear' | 'createdAt'> = {
  title: 'title',
  publishedYear: 'publishedYear',
  createdAt: 'createdAt',
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const search = searchParams.get('search') ?? ''
  const genre = searchParams.get('genre') ?? ''
  const authorName = searchParams.get('authorName') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '10')))
  const sortBy = SORT_MAP[searchParams.get('sortBy') ?? 'createdAt'] ?? 'createdAt'
  const order = (searchParams.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  const where = {
    AND: [
      search ? { title: { contains: search, mode: 'insensitive' as const } } : {},
      genre ? { genre } : {},
      authorName
        ? { author: { name: { contains: authorName, mode: 'insensitive' as const } } }
        : {},
    ],
  }

  const [total, data] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { [sortBy]: order } as any,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  })
}
