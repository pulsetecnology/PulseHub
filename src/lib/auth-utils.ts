import { UserType } from "@/contexts/AuthContextWithNextAuth";

// Interface para relacionamento entre fornecedor e revendedor
export interface SupplierResellerRelation {
  supplierId: string;
  resellerId: string;
  status: "pending" | "approved" | "rejected";
  commission?: number; // Comissão personalizada em porcentagem
  createdAt: Date;
}

// Mock user database for development
export const users = [
  {
    id: "1",
    name: "Fornecedor Teste",
    email: "fornecedor@example.com",
    password: "senha123", // In production, this would be hashed
    type: "fornecedor" as UserType,
    createdAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    name: "Revendedor Teste",
    email: "revendedor@example.com",
    password: "senha123", // In production, this would be hashed
    type: "revendedor" as UserType,
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "3",
    name: "Fornecedor Calçados",
    email: "calcados@example.com",
    password: "senha123",
    type: "fornecedor" as UserType,
    createdAt: new Date("2023-02-10"),
  },
  {
    id: "4",
    name: "Fornecedor Moda Feminina",
    email: "modafeminina@example.com",
    password: "senha123",
    type: "fornecedor" as UserType,
    createdAt: new Date("2023-03-05"),
  },
];

// Mock de relacionamentos entre fornecedores e revendedores
export const supplierResellerRelations: SupplierResellerRelation[] = [
  {
    supplierId: "1",
    resellerId: "2",
    status: "approved",
    commission: 10, // 10% de comissão
    createdAt: new Date(),
  },
  {
    supplierId: "3",
    resellerId: "2",
    status: "approved",
    commission: 15, // 15% de comissão
    createdAt: new Date(),
  },
  {
    supplierId: "4",
    resellerId: "2",
    status: "approved",
    commission: 12, // 12% de comissão
    createdAt: new Date(),
  },
];

// Function to register a new user (for development purposes)
export function registerUser(name: string, email: string, password: string, type: UserType) {
  // Verificar se o email já está em uso
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    throw new Error("Este email já está em uso.");
  }

  const newUser = {
    id: (users.length + 1).toString(),
    name,
    email,
    password,
    type,
    createdAt: new Date(),
  };
  
  users.push(newUser);
  
  // Se for um revendedor, criar relacionamento pendente com o fornecedor padrão
  if (type === "revendedor") {
    supplierResellerRelations.push({
      supplierId: "1", // Fornecedor padrão
      resellerId: newUser.id,
      status: "pending",
      createdAt: new Date(),
    });
  }
  
  return newUser;
}

// Função para obter fornecedores de um revendedor
export function getResellerSuppliers(resellerId: string) {
  const relations = supplierResellerRelations.filter(
    relation => relation.resellerId === resellerId && relation.status === "approved"
  );
  
  return relations.map(relation => {
    const supplier = users.find(user => user.id === relation.supplierId);
    return {
      ...supplier,
      id: supplier?.id as string, // Ensure id is string
      commission: relation.commission,
      relationId: `${relation.supplierId}-${relation.resellerId}`,
      relationStatus: relation.status,
      relationCreatedAt: relation.createdAt
    };
  }).filter(supplier => supplier.id !== undefined); // Filtrar apenas fornecedores válidos
}

// Função para obter revendedores de um fornecedor
export function getSupplierResellers(supplierId: string) {
  const relations = supplierResellerRelations.filter(
    relation => relation.supplierId === supplierId
  );
  
  return relations.map(relation => {
    const reseller = users.find(user => user.id === relation.resellerId);
    return {
      ...reseller,
      id: reseller?.id as string,
      status: relation.status,
      commission: relation.commission,
      createdAt: relation.createdAt,
      type: reseller?.type as "revendedor", // Explicitly cast type to "revendedor"
    };
  });
}

// Função para criar um relacionamento entre fornecedor e revendedor
export function createSupplierResellerRelation(
  supplierId: string,
  resellerId: string,
  status: "pending" | "approved" | "rejected" = "pending",
  commission: number = 10
) {
  // Verificar se já existe um relacionamento
  const existingRelation = supplierResellerRelations.find(
    relation => relation.supplierId === supplierId && relation.resellerId === resellerId
  );
  
  if (existingRelation) {
    // Atualizar o relacionamento existente
    existingRelation.status = status;
    existingRelation.commission = commission;
    return existingRelation;
  }
  
  // Criar novo relacionamento
  const newRelation = {
    supplierId,
    resellerId,
    status,
    commission,
    createdAt: new Date()
  };
  
  supplierResellerRelations.push(newRelation);
  return newRelation;
}

// Função para aprovar um revendedor
export function approveReseller(supplierId: string, resellerId: string, commission?: number) {
  const relationIndex = supplierResellerRelations.findIndex(
    relation => relation.supplierId === supplierId && relation.resellerId === resellerId
  );
  
  if (relationIndex >= 0) {
    supplierResellerRelations[relationIndex].status = "approved";
    if (commission !== undefined) {
      supplierResellerRelations[relationIndex].commission = commission;
    }
    return true;
  }
  
  return false;
}

// Função para verificar se um revendedor tem acesso aos produtos de um fornecedor
export function checkResellerAccess(resellerId: string, supplierId: string) {
  const relation = supplierResellerRelations.find(
    relation => relation.resellerId === resellerId && 
                relation.supplierId === supplierId && 
                relation.status === "approved"
  );
  
  return !!relation;
}

// Mock de produtos para demonstração
export const mockProducts = [
  {
    id: 1,
    name: "Camiseta Básica",
    description: "Camiseta 100% algodão",
    price: 49.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Camiseta"],
    sizes: ["P", "M", "G"],
    supplierId: "1",
    supplierName: "Fornecedor Teste",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Calça Jeans",
    description: "Calça jeans slim",
    price: 129.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Calça"],
    sizes: ["38", "40", "42"],
    supplierId: "1",
    supplierName: "Fornecedor Teste",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Tênis Casual",
    description: "Tênis casual confortável",
    price: 199.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Tênis"],
    sizes: ["39", "40", "41"],
    supplierId: "3",
    supplierName: "Fornecedor Calçados",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Vestido Floral",
    description: "Vestido estampado floral",
    price: 159.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Vestido"],
    sizes: ["P", "M", "G"],
    supplierId: "4",
    supplierName: "Fornecedor Moda Feminina",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];