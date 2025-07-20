import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Limpar dados de teste
export async function POST(req: NextRequest) {
  try {
    console.log('Iniciando limpeza de dados de teste...');
    
    // Primeiro, deletar todos os relacionamentos
    const deletedRelations = await prisma.supplierResellerRelation.deleteMany({});
    console.log(`Deletados ${deletedRelations.count} relacionamentos`);
    
    // Depois, deletar todos os usuários revendedores
    const deletedResellers = await prisma.user.deleteMany({
      where: {
        type: 'revendedor'
      }
    });
    console.log(`Deletados ${deletedResellers.count} usuários revendedores`);
    
    // Verificar usuários restantes
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true
      }
    });
    
    console.log(`Usuários restantes: ${remainingUsers.length}`);
    remainingUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Tipo: ${user.type}`);
    });
    
    return NextResponse.json({ 
      message: 'Dados de teste limpos com sucesso',
      deletedRelations: deletedRelations.count,
      deletedResellers: deletedResellers.count,
      remainingUsers: remainingUsers.length
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao limpar dados de teste:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}