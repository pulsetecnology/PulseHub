import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET: Listar usuários
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type');
    const supplierId = req.nextUrl.searchParams.get('supplierId');
    
    let whereClause: any = {};
    
    if (type) {
      whereClause.type = type;
    }
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        // Incluir relacionamentos se for necessário
        supplierRelations: supplierId ? {
          where: { supplierId },
          select: {
            status: true,
            commission: true,
            createdAt: true
          }
        } : false,
        resellerRelations: supplierId ? {
          where: { supplierId },
          select: {
            status: true,
            commission: true,
            createdAt: true
          }
        } : false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST: Criar um novo usuário
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Dados recebidos para criar usuário:', { ...body, password: '[HIDDEN]' });
    
    // Validar dados obrigatórios
    if (!body.name || !body.email || !body.password || !body.type) {
      console.log('Dados obrigatórios faltando');
      return NextResponse.json({ 
        error: 'Nome, email, senha e tipo são obrigatórios' 
      }, { status: 400 });
    }
    
    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });
    
    console.log('Usuário existente encontrado:', !!existingUser);
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Já existe um usuário com este email' 
      }, { status: 400 });
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(body.password, 12);
    
    // Criar usuário
    console.log('Criando usuário...');
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        type: body.type,
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log('Usuário criado com sucesso:', newUser.id);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erro detalhado ao criar usuário:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}