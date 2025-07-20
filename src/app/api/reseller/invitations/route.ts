import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Buscar convites pendentes para um revendedor
export async function GET(req: NextRequest) {
  try {
    const resellerId = req.nextUrl.searchParams.get('resellerId');
    
    if (!resellerId) {
      return NextResponse.json({ error: 'ID do revendedor é obrigatório' }, { status: 400 });
    }
    
    const pendingInvitations = await prisma.supplierResellerRelation.findMany({
      where: {
        resellerId: resellerId,
        status: 'pending'
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Encontrados ${pendingInvitations.length} convites pendentes para revendedor ${resellerId}`);
    
    return NextResponse.json(pendingInvitations);
  } catch (error) {
    console.error('Erro ao buscar convites pendentes:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// PUT: Responder a um convite (aceitar ou rejeitar)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { relationId, action, resellerId } = body;
    
    if (!relationId || !action || !resellerId) {
      return NextResponse.json({ 
        error: 'ID da relação, ação e ID do revendedor são obrigatórios' 
      }, { status: 400 });
    }
    
    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Ação deve ser "accept" ou "reject"' 
      }, { status: 400 });
    }
    
    // Verificar se a relação existe e pertence ao revendedor
    const relation = await prisma.supplierResellerRelation.findFirst({
      where: {
        id: relationId,
        resellerId: resellerId,
        status: 'pending'
      },
      include: {
        supplier: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!relation) {
      return NextResponse.json({ 
        error: 'Convite não encontrado ou já foi respondido' 
      }, { status: 404 });
    }
    
    // Atualizar o status da relação
    const newStatus = action === 'accept' ? 'approved' : 'rejected';
    
    const updatedRelation = await prisma.supplierResellerRelation.update({
      where: { id: relationId },
      data: { status: newStatus },
      include: {
        supplier: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log(`Convite ${action === 'accept' ? 'aceito' : 'rejeitado'} pelo revendedor ${resellerId}`);
    
    return NextResponse.json({
      message: `Convite ${action === 'accept' ? 'aceito' : 'rejeitado'} com sucesso`,
      relation: updatedRelation
    });
  } catch (error) {
    console.error('Erro ao responder convite:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}