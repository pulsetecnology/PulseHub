import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Obter uma categoria por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        products: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error(`Erro ao buscar categoria ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT: Atualizar uma categoria
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    // Validar dados
    if (!body.name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    
    // Se o slug foi alterado, verificar se já existe
    if (body.slug) {
      const existingCategory = await prisma.category.findFirst({
        where: { 
          slug: body.slug,
          id: { not: parseInt(params.id) }
        }
      });
      
      if (existingCategory) {
        return NextResponse.json({ error: 'Já existe uma categoria com este slug' }, { status: 400 });
      }
    }
    
    // Atualizar categoria
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        description: body.description,
        slug: body.slug,
      }
    });
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(`Erro ao atualizar categoria ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE: Excluir uma categoria
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar se existem produtos associados a esta categoria
    const productsCount = await prisma.product.count({
      where: { categoryId: parseInt(params.id) }
    });
    
    if (productsCount > 0) {
      return NextResponse.json({ 
        error: 'Não é possível excluir esta categoria pois existem produtos associados a ela',
        productsCount
      }, { status: 400 });
    }
    
    // Excluir categoria
    await prisma.category.delete({
      where: { id: parseInt(params.id) }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao excluir categoria ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}