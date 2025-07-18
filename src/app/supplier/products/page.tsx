"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiPlus, FiSearch, FiFilter, FiChevronDown, FiX, FiEdit, FiTrash2, FiStar } from "react-icons/fi";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

// Dados mockados para demonstração
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Camiseta Básica",
    description: "Camiseta 100% algodão",
    price: 49.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Camiseta"],
    sizes: ["P", "M", "G"],
    featured: false,
  },
  {
    id: 2,
    name: "Calça Jeans",
    description: "Calça jeans slim",
    price: 129.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Calça"],
    sizes: ["38", "40", "42"],
    featured: true,
  },
  {
    id: 3,
    name: "Tênis Casual",
    description: "Tênis casual confortável",
    price: 199.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Tênis"],
    sizes: ["39", "40", "41"],
    featured: false,
  },
  {
    id: 4,
    name: "Vestido Floral",
    description: "Vestido estampado floral",
    price: 159.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Vestido"],
    sizes: ["P", "M", "G"],
    featured: true,
  },
  {
    id: 5,
    name: "Camisa Social",
    description: "Camisa social de algodão",
    price: 89.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Camisa"],
    sizes: ["P", "M", "G", "GG"],
    featured: false,
  },
  {
    id: 6,
    name: "Sapato Social",
    description: "Sapato social em couro",
    price: 249.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Sapato"],
    sizes: ["38", "39", "40", "41", "42"],
    featured: false,
  },
  {
    id: 7,
    name: "Blusa Feminina",
    description: "Blusa feminina em tecido leve",
    price: 79.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Blusa"],
    sizes: ["P", "M", "G"],
    featured: false,
  },
  {
    id: 8,
    name: "Jaqueta Jeans",
    description: "Jaqueta jeans oversized",
    price: 189.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Jaqueta"],
    sizes: ["P", "M", "G"],
    featured: false,
  },
];

// Opções de filtro para categorias
const categoryOptions = [
  { value: "all", label: "Todas as categorias" },
  { value: "roupas", label: "Roupas" },
  { value: "calcados", label: "Calçados" },
  { value: "acessorios", label: "Acessórios" },
];

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useNextAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    // Redireciona se não estiver autenticado ou não for fornecedor
    if (!user) {
      router.push("/login?type=fornecedor");
    } else if (user.type !== "fornecedor") {
      router.push("/");
    }
  }, [user, router]);

  // Filtra produtos com base nos critérios
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    const matchesCategory = selectedCategory === "all" || true; // Implementar quando tivermos categorias
    
    const matchesFeatured = showFeaturedOnly ? product.featured : true;
    
    return matchesSearch && matchesCategory && matchesFeatured;
  });

  // Paginação
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleAddProduct = () => {
    router.push("/supplier/products/add");
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      setProducts(prev => prev.filter(product => product.id !== productId));
    }
  };

  const handleToggleFeatured = (productId: number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, featured: !product.featured } 
          : product
      )
    );
  };

  if (!user || user.type !== "fornecedor") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meus Produtos</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie seu catálogo de produtos disponíveis para revendedores
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <FiPlus className="mr-2" />
            Adicionar Produto
          </button>
        </div>

        {/* Barra de busca e filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* Botões de visualização */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-lg border ${
                viewMode === "grid"
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              }`}
              title="Visualização em grade"
            >
              Grade
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 rounded-lg border ${
                viewMode === "table"
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              }`}
              title="Visualização em tabela"
            >
              Tabela
            </button>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <FiFilter className="mr-2" />
              Filtros
              <FiChevronDown className="ml-2" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800 dark:text-white">Filtros</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <FiX size={18} />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showFeaturedOnly}
                        onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Mostrar apenas produtos em destaque
                      </span>
                    </label>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setShowFeaturedOnly(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg flex items-center">
            <span className="text-blue-700 dark:text-blue-300 text-sm">
              {filteredProducts.length} produtos encontrados
            </span>
          </div>
        </div>

        {/* Visualização em Grade */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map(product => (
              <div key={product.id} className="relative">
                <ProductCard
                  product={product}
                  onDelete={() => handleDeleteProduct(product.id)}
                  isSupplier={true}
                  onToggleFeatured={() => handleToggleFeatured(product.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Visualização em Tabela */}
        {viewMode === "table" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Produto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Preço
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tamanhos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Destaque
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                              <img
                                src={product.imageUrls[0]}
                                alt={product.name}
                                className="h-10 w-10 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                N/A
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {product.description?.substring(0, 50)}
                              {product.description && product.description.length > 50 ? "..." : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {product.sizes?.map((size) => (
                            <span
                              key={size}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.featured ? (
                          <span className="bg-yellow-400 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                            Destaque
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleFeatured(product.id)}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Marcar destaque
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/supplier/products/${product.id}/edit`}>
                            <button className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                              <FiEdit size={18} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Próxima
              </button>
            </nav>
          </div>
        )}

        {/* Mensagem quando não há produtos */}
        {filteredProducts.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              Nenhum produto encontrado.
            </div>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Adicionar Produto
            </button>
          </div>
        )}

        {/* Informações sobre produtos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Sobre os Produtos</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              <strong>O que são produtos em destaque?</strong> Produtos em destaque aparecem com prioridade no catálogo dos revendedores, aumentando sua visibilidade.
            </p>
            <p>
              <strong>Como adicionar um produto?</strong> Clique no botão "Adicionar Produto" acima e preencha o formulário com os dados do produto, incluindo imagens, preço e tamanhos disponíveis.
            </p>
            <p>
              <strong>Como gerenciar produtos?</strong> Você pode editar, excluir ou destacar produtos usando os botões de ação na tabela ou nos cards de produto.
            </p>
            <p>
              <strong>Quem pode ver meus produtos?</strong> Apenas revendedores aprovados por você terão acesso ao seu catálogo de produtos.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}