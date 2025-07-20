import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Obter um relacionamento específico
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const relation = await prisma.supplierResellerRelation.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true
          }
        },
        reseller: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true
          }
        }
      }
    });
    
    if (!relation) {
      return NextResponse.json({ error: 'Relacionamento não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(relation);
  } catch (error) {
    console.error(`Erro ao buscar relacionamento ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT: Atualizar um relacionamento
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    const updateData: any = {};
    
    if (body.status !== undefined) updateData.status = body.status;
    if (body.commission !== undefined) updateData.commission = parseFloat(body.commission);
    
    const updatedRelation = await prisma.supplierResellerRelation.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true
          }
        },
        reseller: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedRelation);
  } catch (error) {
    console.error(`Erro ao atualizar relacionamento ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE: Excluir um relacionamento
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.supplierResellerRelation.delete({
      where: { id: parseInt(params.id) }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao excluir relacionamento ${params.id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}