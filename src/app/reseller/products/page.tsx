'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiSearch, FiFilter, FiGrid, FiList, FiShoppingBag, FiChevronDown, FiX } from "react-icons/fi";
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
  commission?: number;
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
  commission?: number;
}

export default function ResellerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('supplierId');
  const { user } = useNextAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>(supplierId || "all");
  const [categories, setCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [groupBySupplier, setGroupBySupplier] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.type !== "revendedor") {
      router.push("/");
    } else {
      fetchSuppliers();
      fetchProducts();
    }
  }, [user, router, supplierId]);

  const fetchSuppliers = async () => {
    try {
      // Buscar fornecedores aprovados para este revendedor
      const response = await fetch(`/api/supplier-reseller-relations?resellerId=${user?.id}&status=approved`);
      if (!response.ok) throw new Error('Falha ao buscar fornecedores');

      const relations = await response.json();

      // Transformar os dados para o formato esperado
      const suppliersList = relations.map((relation: any) => ({
        id: relation.supplier.id,
        name: relation.supplier.name,
        email: relation.supplier.email,
        commission: relation.commission
      }));

      setSuppliers(suppliersList);
    } catch (error) {
      console.error(error);
      addToast("Ocorreu um erro ao buscar os fornecedores.", "error");
    }
  };

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
      const uniqueCategories = [...new Set(data.map((product: Product) => product.category))].filter(Boolean) as string[];
      setCategories(uniqueCategories);

      setProducts(data);
    } catch (error) {
      console.error(error);
      addToast("Ocorreu um erro ao buscar os produtos.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar produtos com base no termo de busca, categoria e fornecedor
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesSupplier = supplierFilter === "all" || product.supplierId === supplierFilter;

    return matchesSearch && matchesCategory && matchesSupplier;
  });

  // Agrupar produtos por fornecedor se necessário
  type GroupedProductEntry = [string, { supplierName: string; products: Product[] }];

  const groupedProducts: GroupedProductEntry[] = groupBySupplier
    ? Object.entries(
      filteredProducts.reduce((acc, product) => {
        const supplierId = product.supplierId || 'unknown';
        if (!acc[supplierId]) {
          acc[supplierId] = {
            supplierName: product.supplierName || 'Fornecedor Desconhecido',
            products: []
          };
        }
        acc[supplierId].products.push(product);
        return acc;
      }, {} as Record<string, { supplierName: string; products: Product[] }>)
    )
    : [['all', { supplierName: 'Todos os Produtos', products: filteredProducts }]];

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
              className={`p-2 rounded-md ${viewMode === "grid"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              title="Visualização em grade"
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md ${viewMode === "list"
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
          <div className="flex items-center gap-2">
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
                        Fornecedor
                      </label>
                      <select
                        value={supplierFilter}
                        onChange={(e) => setSupplierFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">Todos os fornecedores</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name} {supplier.commission ? `(${supplier.commission}%)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoria
                      </label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">Todas as categorias</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={groupBySupplier}
                          onChange={(e) => setGroupBySupplier(e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Agrupar por fornecedor
                        </span>
                      </label>
                    </div>

                    <button
                      onClick={() => {
                        setSupplierFilter("all");
                        setCategoryFilter("all");
                        setGroupBySupplier(false);
                        setIsFilterOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                    >
                      Limpar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações sobre fornecedores */}
        {suppliers.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Seus Fornecedores</h2>
            <div className="flex flex-wrap gap-2">
              {suppliers.map(supplier => (
                <div
                  key={supplier.id}
                  className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${supplierFilter === supplier.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30'
                    }`}
                  onClick={() => setSupplierFilter(supplierFilter === supplier.id ? "all" : supplier.id)}
                >
                  {supplier.name} {supplier.commission ? `(${supplier.commission}%)` : ''}
                </div>
              ))}
            </div>
          </div>
        )}

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
          groupBySupplier ? (
            <div className="space-y-8">
              {groupedProducts.map(([supplierId, group]) => (
                <div key={supplierId} className="space-y-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{group.supplierName}</h2>
                    <div className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                      {group.products.length} produtos
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {group.products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <Link href={`/reseller/products/${product.id}`}>
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
                        </Link>
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
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/reseller/products/${product.id}`}>
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
                </Link>
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
                          <Link href={`/reseller/products/${product.id}`} className="flex items-center">
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
                          </Link>
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