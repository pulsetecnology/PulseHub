import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Listar todos os usuários para debug
export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        createdAt: true,
        _count: {
          select: {
            supplierRelations: true,
            resellerRelations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Encontrados ${users.length} usuários no banco`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Tipo: ${user.type} - Relacionamentos: ${user._count.supplierRelations + user._count.resellerRelations}`);
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}