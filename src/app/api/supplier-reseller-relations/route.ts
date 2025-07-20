import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Listar relacionamentos
export async function GET(req: NextRequest) {
  try {
    const supplierId = req.nextUrl.searchParams.get('supplierId');
    const resellerId = req.nextUrl.searchParams.get('resellerId');
    const status = req.nextUrl.searchParams.get('status');
    
    console.log('Parâmetros recebidos para buscar relacionamentos:', { supplierId, resellerId, status });
    
    let whereClause: any = {};
    
    if (supplierId) {
      whereClause.supplierId = supplierId;
    }
    
    if (resellerId) {
      whereClause.resellerId = resellerId;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    console.log('Cláusula WHERE:', whereClause);
    
    const relations = await prisma.supplierResellerRelation.findMany({
      where: whereClause,
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
    
    console.log(`Encontrados ${relations.length} relacionamentos`);
    return NextResponse.json(relations);
  } catch (error) {
    console.error('Erro detalhado ao buscar relacionamentos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// POST: Criar um novo relacionamento
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Dados recebidos para criar relacionamento:', body);
    
    // Validar dados obrigatórios
    if (!body.supplierId || !body.resellerId) {
      console.log('Dados obrigatórios faltando:', { supplierId: body.supplierId, resellerId: body.resellerId });
      return NextResponse.json({ 
        error: 'ID do fornecedor e do revendedor são obrigatórios' 
      }, { status: 400 });
    }
    
    // Verificar se os usuários existem
    const supplier = await prisma.user.findUnique({
      where: { id: body.supplierId }
    });
    
    const reseller = await prisma.user.findUnique({
      where: { id: body.resellerId }
    });
    
    console.log('Usuários encontrados:', { 
      supplier: supplier ? { id: supplier.id, name: supplier.name, type: supplier.type } : null, 
      reseller: reseller ? { id: reseller.id, name: reseller.name, type: reseller.type } : null 
    });
    
    if (!supplier) {
      return NextResponse.json({ 
        error: `Fornecedor com ID ${body.supplierId} não encontrado` 
      }, { status: 400 });
    }
    
    if (!reseller) {
      return NextResponse.json({ 
        error: `Revendedor com ID ${body.resellerId} não encontrado` 
      }, { status: 400 });
    }
    
    if (supplier.type !== 'fornecedor') {
      return NextResponse.json({ 
        error: 'O usuário fornecedor deve ter tipo "fornecedor"' 
      }, { status: 400 });
    }
    
    if (reseller.type !== 'revendedor') {
      return NextResponse.json({ 
        error: 'O usuário revendedor deve ter tipo "revendedor"' 
      }, { status: 400 });
    }
    
    // Verificar se o relacionamento já existe
    const existingRelation = await prisma.supplierResellerRelation.findUnique({
      where: {
        supplierId_resellerId: {
          supplierId: body.supplierId,
          resellerId: body.resellerId
        }
      }
    });
    
    console.log('Relacionamento existente:', !!existingRelation);
    
    if (existingRelation) {
      return NextResponse.json({ 
        error: 'Relacionamento já existe entre este fornecedor e revendedor' 
      }, { status: 400 });
    }
    
    // Criar relacionamento
    console.log('Criando relacionamento...');
    const newRelation = await prisma.supplierResellerRelation.create({
      data: {
        supplierId: body.supplierId,
        resellerId: body.resellerId,
        status: body.status || 'approved',
        commission: body.commission || 10.0,
      },
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
    
    console.log('Relacionamento criado com sucesso:', newRelation.id);
    return NextResponse.json(newRelation, { status: 201 });
  } catch (error) {
    console.error('Erro detalhado ao criar relacionamento:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}