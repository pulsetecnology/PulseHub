import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Listar todas as categorias
export async function GET(req: NextRequest) {
  try {
    const supplierId = req.nextUrl.searchParams.get('supplierId');
    
    const whereClause = supplierId ? { supplierId } : {};
    
    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST: Criar uma nova categoria
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validar dados
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: 'Nome e slug são obrigatórios' }, { status: 400 });
    }
    
    // Verificar se já existe uma categoria com o mesmo slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug: body.slug }
    });
    
    if (existingCategory) {
      return NextResponse.json({ error: 'Já existe uma categoria com este slug' }, { status: 400 });
    }
    
    // Criar categoria
    const newCategory = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description,
        slug: body.slug,
        supplierId: body.supplierId,
        sizeType: body.sizeType,
        customSizes: body.customSizes ? JSON.stringify(body.customSizes) : null,
      }
    });
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}