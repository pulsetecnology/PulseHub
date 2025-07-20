import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para converter um arquivo para base64
async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

// GET: Listar produtos com filtros
export async function GET(req: NextRequest) {
  try {
    const supplierId = req.nextUrl.searchParams.get('supplierId');
    const resellerId = req.nextUrl.searchParams.get('resellerId');
    const resellerView = req.nextUrl.searchParams.get('resellerView') === 'true';
    
    let whereClause: any = {};
    let supplierIds: string[] = [];
    
    // Se for uma visualização de revendedor e tiver um ID de revendedor
    if (resellerView && resellerId) {
      // Buscar todos os fornecedores aprovados para este revendedor
      const relations = await prisma.supplierResellerRelation.findMany({
        where: {
          resellerId: resellerId,
          status: 'approved'
        },
        select: {
          supplierId: true,
          commission: true,
          supplier: {
            select: {
              name: true
            }
          }
        }
      });
      
      // Extrair IDs dos fornecedores
      supplierIds = relations.map(relation => relation.supplierId);
      
      // Se não houver fornecedores aprovados, retornar lista vazia
      if (supplierIds.length === 0) {
        return NextResponse.json([]);
      }
      
      // Se tiver um fornecedor específico, filtrar apenas por ele
      if (supplierId) {
        // Verificar se o fornecedor está na lista de aprovados
        if (!supplierIds.includes(supplierId)) {
          return NextResponse.json([]);
        }
        whereClause.supplierId = supplierId;
      } else {
        // Caso contrário, filtrar por todos os fornecedores aprovados
        whereClause.supplierId = {
          in: supplierIds
        };
      }
      
      // Buscar produtos com o filtro
      const products = await prisma.product.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Formatar os produtos para o frontend e adicionar comissão
      const formattedProducts = products.map(product => {
        // Encontrar a relação correspondente para obter a comissão
        const relation = relations.find(r => r.supplierId === product.supplierId);
        
        return {
          ...product,
          sizes: product.sizes ? product.sizes.split(',') : [],
          targetAudiences: product.targetAudiences ? product.targetAudiences.split(',') : [],
          imageUrls: product.imageUrls ? product.imageUrls.split('[IMAGE]') : [],
          commission: relation ? relation.commission : undefined
        };
      });
      
      return NextResponse.json(formattedProducts);
    } 
    // Caso seja uma busca por fornecedor específico (sem ser visualização de revendedor)
    else if (supplierId) {
      whereClause.supplierId = supplierId;
    }
    
    // Busca padrão de produtos
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Formatar os produtos para o frontend
    const formattedProducts = products.map(product => ({
      ...product,
      sizes: product.sizes ? product.sizes.split(',') : [],
      targetAudiences: product.targetAudiences ? product.targetAudiences.split(',') : [],
      imageUrls: product.imageUrls ? product.imageUrls.split('[IMAGE]') : [],
    }));
    
    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST: Criar um novo produto
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    
    // Converter todas as imagens para base64
    const base64Images = await Promise.all(files.map(fileToBase64));

    const newProduct = await prisma.product.create({
      data: {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        category: formData.get('category') as string,
        sizes: formData.get('sizes') as string,
        targetAudiences: formData.get('targetAudiences') as string,
        featured: formData.get('featured') === 'true',
        supplierId: formData.get('supplierId') as string,
        supplierName: formData.get('supplierName') as string,
        imageUrls: base64Images.join('[IMAGE]'), // Usar um separador robusto
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
