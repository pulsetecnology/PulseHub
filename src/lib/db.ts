// Simulação de banco de dados usando localStorage para persistência entre sessões
// Em uma aplicação real, isso seria substituído por um banco de dados real

export interface DbProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrls: string[];
  category?: string;
  sizes?: string[];
  targetAudiences?: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  supplierId?: string;
  supplierName?: string;
  commission?: number;
}

// Função para inicializar o banco de dados
export function initDb() {
  if (typeof window === 'undefined') return; // Não executar no servidor
  
  // Verificar se já existe algum produto no localStorage
  const products = localStorage.getItem('products');
  if (!products) {
    // Inicializar com alguns produtos de exemplo
    const initialProducts: DbProduct[] = [
      {
        id: 1,
        name: "Camiseta Básica",
        description: "Camiseta 100% algodão, corte regular, gola redonda. Peça versátil e confortável para o dia a dia.",
        price: 49.90,
        imageUrls: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1622445275576-721325763afe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
        ],
        category: "roupas",
        sizes: ["P", "M", "G"],
        featured: false,
        createdAt: new Date("2023-05-15"),
        updatedAt: new Date("2023-06-10"),
        supplierId: "1",
        supplierName: "Fornecedor Teste"
      },
      {
        id: 2,
        name: "Calça Jeans",
        description: "Calça jeans slim fit, 98% algodão e 2% elastano. Confortável e durável, ideal para uso casual.",
        price: 129.90,
        imageUrls: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1582552938357-32b906df40cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
        ],
        category: "roupas",
        sizes: ["38", "40", "42"],
        featured: true,
        createdAt: new Date("2023-04-20"),
        updatedAt: new Date("2023-06-05"),
        supplierId: "1",
        supplierName: "Fornecedor Teste"
      }
    ];
    
    localStorage.setItem('products', JSON.stringify(initialProducts));
  }
}

// Função para obter todos os produtos
export function getAllProducts(): DbProduct[] {
  if (typeof window === 'undefined') return []; // Não executar no servidor
  
  const products = localStorage.getItem('products');
  return products ? JSON.parse(products) : [];
}

// Função para obter um produto por ID
export function getProductById(id: number): DbProduct | null {
  if (typeof window === 'undefined') return null; // Não executar no servidor
  
  const products = getAllProducts();
  return products.find(product => product.id === id) || null;
}

// Função para adicionar um novo produto
export function addProduct(product: Omit<DbProduct, 'id' | 'createdAt' | 'updatedAt'>): DbProduct {
  if (typeof window === 'undefined') throw new Error('Não é possível adicionar produtos no servidor'); 
  
  const products = getAllProducts();
  
  // Gerar um novo ID (em um banco real, isso seria automático)
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  
  const now = new Date();
  const newProduct: DbProduct = {
    ...product,
    id: newId,
    createdAt: now,
    updatedAt: now
  };
  
  products.push(newProduct);
  localStorage.setItem('products', JSON.stringify(products));
  
  return newProduct;
}

// Função para atualizar um produto existente
export function updateProduct(id: number, updates: Partial<DbProduct>): DbProduct | null {
  if (typeof window === 'undefined') throw new Error('Não é possível atualizar produtos no servidor');
  
  const products = getAllProducts();
  const index = products.findIndex(product => product.id === id);
  
  if (index === -1) return null;
  
  const updatedProduct = {
    ...products[index],
    ...updates,
    id, // Garantir que o ID não seja alterado
    updatedAt: new Date()
  };
  
  products[index] = updatedProduct;
  localStorage.setItem('products', JSON.stringify(products));
  
  return updatedProduct;
}

// Função para excluir um produto
export function deleteProduct(id: number): boolean {
  if (typeof window === 'undefined') throw new Error('Não é possível excluir produtos no servidor');
  
  const products = getAllProducts();
  const filteredProducts = products.filter(product => product.id !== id);
  
  if (filteredProducts.length === products.length) return false;
  
  localStorage.setItem('products', JSON.stringify(filteredProducts));
  return true;
}

// Função para converter um arquivo de imagem para base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Função para salvar imagens de um produto
export async function saveProductImages(files: File[]): Promise<string[]> {
  if (typeof window === 'undefined') throw new Error('Não é possível salvar imagens no servidor');
  
  try {
    // Converter todos os arquivos para base64
    const imagePromises = files.map(file => fileToBase64(file));
    const base64Images = await Promise.all(imagePromises);
    
    // Em uma aplicação real, você enviaria essas imagens para um serviço como Cloudinary
    // e armazenaria as URLs retornadas. Aqui, vamos apenas armazenar as strings base64.
    return base64Images;
  } catch (error) {
    console.error('Erro ao salvar imagens:', error);
    throw error;
  }
}

// Inicializar o banco de dados quando o módulo for carregado
if (typeof window !== 'undefined') {
  initDb();
}