import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Obter um produto por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Erro ao buscar produto ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT: Atualizar um produto
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    // O corpo já deve vir com os campos formatados corretamente do frontend
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: {
        ...body,
        price: parseFloat(body.price), // Garantir que o preço seja um número
        imageUrls: body.imageUrls.join('[IMAGE]'), // Usar o separador correto
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Erro ao atualizar produto ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE: Excluir um produto
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({
      where: { id: parseInt(params.id) },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao excluir produto ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
