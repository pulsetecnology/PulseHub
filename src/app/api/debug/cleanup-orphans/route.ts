import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Limpar apenas usuários órfãos (sem relacionamentos)
export async function POST(req: NextRequest) {
  try {
    console.log('Iniciando limpeza de usuários órfãos...');
    
    // Buscar usuários revendedores sem relacionamentos
    const orphanResellers = await prisma.user.findMany({
      where: {
        type: 'revendedor',
        AND: [
          {
            supplierRelations: {
              none: {}
            }
          },
          {
            resellerRelations: {
              none: {}
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    console.log(`Encontrados ${orphanResellers.length} usuários revendedores órfãos`);
    orphanResellers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    // Deletar usuários órfãos
    const deletedOrphans = await prisma.user.deleteMany({
      where: {
        type: 'revendedor',
        AND: [
          {
            supplierRelations: {
              none: {}
            }
          },
          {
            resellerRelations: {
              none: {}
            }
          }
        ]
      }
    });
    
    console.log(`Deletados ${deletedOrphans.count} usuários órfãos`);
    
    return NextResponse.json({ 
      message: 'Usuários órfãos removidos com sucesso',
      deletedOrphans: deletedOrphans.count,
      orphansList: orphanResellers
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao limpar usuários órfãos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}