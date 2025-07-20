"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import ProductCard from "@/components/ProductCard";
import { FiSearch, FiFilter, FiShoppingBag, FiX, FiChevronDown } from "react-icons/fi";
import { Product } from "@/types/product";
import { getResellerSuppliers, getResellerProducts, mockProducts } from "@/lib/auth-utils";

// Interface para fornecedor com comissão
interface SupplierWithCommission {
  id: string;
  name?: string;
  email?: string;
  commission?: number;
}

export default function ResellerDashboard() {
  const router = useRouter();
  const { user } = useNextAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [suppliers, setSuppliers] = useState<SupplierWithCommission[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [groupBySupplier, setGroupBySupplier] = useState(true);

  useEffect(() => {
    // Redireciona se não estiver autenticado ou não for revendedor
    if (!user) {
      router.push("/login?type=revendedor");
    } else if (user.type !== "revendedor") {
      router.push("/");
    } else {
      // Carrega os fornecedores aprovados para este revendedor
      const resellerSuppliers = getResellerSuppliers(user.id || "2"); // Fallback para o ID 2 (revendedor teste)
      setSuppliers(resellerSuppliers);
      
      // Carrega os produtos disponíveis para este revendedor com as comissões corretas
      const resellerProducts = getResellerProducts(user.id || "2");
      setProducts(resellerProducts);
    }
  }, [user, router]);

  // Filtra produtos com base no termo de busca e fornecedor selecionado
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = selectedSupplier ? product.supplierId === selectedSupplier : true;
    
    return matchesSearch && matchesSupplier;
  });

  // Agrupa produtos por fornecedor
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

  if (!user || user.type !== "revendedor") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Catálogo de Produtos</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore os produtos disponíveis para revenda
          </p>
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
                      value={selectedSupplier || ''}
                      onChange={(e) => setSelectedSupplier(e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todos os fornecedores</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} {supplier.commission ? `(${supplier.commission}%)` : ''}
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
                      setSelectedSupplier(null);
                      setGroupBySupplier(true);
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">
            <FiShoppingBag className="mr-2" />
            Meu Carrinho (0)
          </button>
        </div>

        {/* Informações sobre fornecedores */}
        {suppliers.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Seus Fornecedores</h2>
            <div className="flex flex-wrap gap-2">
              {suppliers.map(supplier => (
                <div 
                  key={supplier.id}
                  className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                    selectedSupplier === supplier.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30'
                  }`}
                  onClick={() => setSelectedSupplier(selectedSupplier === supplier.id ? null : supplier.id)}
                >
                  {supplier.name} {supplier.commission ? `(${supplier.commission}%)` : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de produtos agrupados por fornecedor */}
        <div className="space-y-8">
          {groupedProducts.map(([supplierId, group]) => (
            <div key={supplierId} className="space-y-4">
              {groupBySupplier && (
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{group.supplierName}</h2>
                  <div className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                    {group.products.length} produtos
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSupplier={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há produtos */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}