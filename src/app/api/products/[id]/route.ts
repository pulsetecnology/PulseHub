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

    // Converter strings de volta para arrays para o frontend
    const formattedProduct = {
      ...product,
      sizes: product.sizes ? product.sizes.split(',') : [],
      targetAudiences: product.targetAudiences ? product.targetAudiences.split(',') : [],
      imageUrls: product.imageUrls ? product.imageUrls.split('[IMAGE]') : [],
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error(`Erro ao buscar produto ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT: Atualizar um produto
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    // Log para debug
    console.log('Dados recebidos para atualização:', JSON.stringify(body, null, 2));
    
    // Preparar os dados para atualização
    const updateData: any = {};
    
    // Atualizar apenas os campos que foram enviados na requisição
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.category) updateData.category = body.category;
    if (body.sizes) updateData.sizes = body.sizes;
    if (body.targetAudiences) updateData.targetAudiences = body.targetAudiences;
    if (body.supplierId) updateData.supplierId = body.supplierId;
    if (body.supplierName) updateData.supplierName = body.supplierName;
    
    // Tratar imageUrls apenas se estiver presente
    if (body.imageUrls !== undefined) {
      if (Array.isArray(body.imageUrls)) {
        updateData.imageUrls = body.imageUrls.join('[IMAGE]');
      } else {
        updateData.imageUrls = body.imageUrls;
      }
    }
    
    console.log('Dados para atualização:', updateData);
    
    // Atualizar o produto com os campos fornecidos
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: updateData
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Erro ao atualizar produto ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error }, { status: 500 });
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
