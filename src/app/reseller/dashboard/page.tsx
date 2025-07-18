"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import ProductCard from "@/components/ProductCard";
import { FiSearch, FiFilter, FiShoppingBag } from "react-icons/fi";
import { Product } from "@/types/product";

// Dados mockados para demonstração
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Camiseta Básica",
    description: "Camiseta 100% algodão",
    price: 49.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Camiseta"],
    sizes: ["P", "M", "G"],
  },
  {
    id: 2,
    name: "Calça Jeans",
    description: "Calça jeans slim",
    price: 129.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Calça"],
    sizes: ["38", "40", "42"],
  },
  {
    id: 3,
    name: "Tênis Casual",
    description: "Tênis casual confortável",
    price: 199.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Tênis"],
    sizes: ["39", "40", "41"],
  },
  {
    id: 4,
    name: "Vestido Floral",
    description: "Vestido estampado floral",
    price: 159.90,
    imageUrls: ["https://via.placeholder.com/500x500?text=Vestido"],
    sizes: ["P", "M", "G"],
  },
];

export default function ResellerDashboard() {
  const router = useRouter();
  const { user } = useNextAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>(mockProducts);

  useEffect(() => {
    // Redireciona se não estiver autenticado ou não for revendedor
    if (!user) {
      router.push("/login?type=revendedor");
    } else if (user.type !== "revendedor") {
      router.push("/");
    }
  }, [user, router]);

  // Filtra produtos com base no termo de busca
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
            <FiFilter className="mr-2" />
            Filtros
          </button>
          <button className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">
            <FiShoppingBag className="mr-2" />
            Meu Carrinho (0)
          </button>
        </div>

        {/* Lista de produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isSupplier={false}
            />
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