import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Listar todos os relacionamentos para debug
export async function GET(req: NextRequest) {
  try {
    const relations = await prisma.supplierResellerRelation.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Encontrados ${relations.length} relacionamentos no banco`);
    relations.forEach(relation => {
      console.log(`- Relacionamento ${relation.id}: ${relation.supplier.name} -> ${relation.reseller.name} (Status: ${relation.status})`);
    });
    
    return NextResponse.json(relations);
  } catch (error) {
    console.error('Erro ao buscar relacionamentos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}