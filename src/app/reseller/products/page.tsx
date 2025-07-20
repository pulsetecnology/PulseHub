'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiSearch, FiFilter, FiGrid, FiList, FiShoppingBag } from "react-icons/fi";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import ImageFallback from "@/components/ImageFallback";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  sizes: string[];
  targetAudiences: string[];
  imageUrls: string[];
  featured: boolean;
  supplierId: string;
  supplierName: string;
}

export default function ResellerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('supplierId');
  const { user } = useNextAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.type !== "revendedor") {
      router.push("/");
    } else {
      fetchProducts();
    }
  }, [user, router, supplierId]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Buscar produtos do fornecedor específico ou de todos os fornecedores aprovados
      const url = supplierId 
        ? `/api/products?supplierId=${supplierId}&resellerView=true` 
        : `/api/products?resellerView=true&resellerId=${user?.id}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao buscar produtos');
      
      const data = await response.json();
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(data.map((product: Product) => product.category))];
      setCategories(uniqueCategories);
      
      setProducts(data);
    } catch (error) {
      console.error(error);
      addToast("Ocorreu um erro ao buscar os produtos.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar produtos com base no termo de busca e categoria
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (!user || user.type !== "revendedor") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {supplierId ? "Produtos do Fornecedor" : "Todos os Produtos"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {supplierId 
                ? "Produtos disponíveis para revenda deste fornecedor" 
                : "Produtos disponíveis para revenda de todos os seus fornecedores"}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              title="Visualização em grade"
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              title="Visualização em lista"
            >
              <FiList size={20} />
            </button>
          </div>
        </div>

        {/* Filtros e busca */}
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
          <div className="flex items-center">
            <FiFilter className="mr-2 text-gray-500 dark:text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de produtos */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || categoryFilter !== "all"
                ? "Nenhum produto encontrado com os filtros atuais."
                : supplierId
                ? "Este fornecedor ainda não tem produtos disponíveis."
                : "Você ainda não tem produtos disponíveis para revenda."}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {!searchTerm && categoryFilter === "all" && (
                <>
                  {supplierId
                    ? "Aguarde até que o fornecedor adicione produtos ao catálogo."
                    : "Aceite convites de fornecedores para ter acesso aos produtos deles."}
                </>
              )}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <ImageFallback
                    src={product.imageUrls[0] || "https://via.placeholder.com/500x500?text=" + encodeURIComponent(product.name)}
                    alt={product.name}
                    className="w-full h-full"
                  />
                  {product.featured && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-md">
                      Destaque
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>
                    <span className="text-primary font-bold">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {product.description || "Sem descrição"}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Fornecedor: {product.supplierName}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.sizes.slice(0, 5).map((size) => (
                      <span
                        key={size}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
                      >
                        {size}
                      </span>
                    ))}
                    {product.sizes.length > 5 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                        +{product.sizes.length - 5}
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/reseller/products/${product.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                    >
                      <FiShoppingBag className="mr-2" />
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Produto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fornecedor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tamanhos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Preço
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                            <ImageFallback
                              src={product.imageUrls[0] || "https://via.placeholder.com/100x100?text=" + encodeURIComponent(product.name)}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-10 h-10"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {product.description || "Sem descrição"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.supplierName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {product.sizes.slice(0, 3).map((size) => (
                            <span
                              key={size}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
                            >
                              {size}
                            </span>
                          ))}
                          {product.sizes.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                              +{product.sizes.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary">
                          {formatPrice(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/reseller/products/${product.id}`}
                          className="text-primary hover:text-primary-hover"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Informações sobre produtos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Sobre os Produtos</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              <strong>Como funciona?</strong> Você pode revender os produtos dos fornecedores com os quais tem vínculo aprovado.
            </p>
            <p>
              <strong>Comissões:</strong> Você recebe a comissão definida pelo fornecedor para cada venda realizada.
            </p>
            <p>
              <strong>Múltiplos Fornecedores:</strong> Você pode revender produtos de vários fornecedores simultaneamente.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}