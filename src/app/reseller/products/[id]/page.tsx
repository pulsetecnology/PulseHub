'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiArrowLeft, FiShoppingBag, FiTag, FiUser, FiDollarSign } from "react-icons/fi";
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

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const { user } = useNextAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.type !== "revendedor") {
      router.push("/");
    } else if (productId) {
      fetchProduct();
    }
  }, [user, router, productId]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}?resellerView=true&resellerId=${user?.id}`);
      if (!response.ok) throw new Error('Falha ao buscar produto');
      
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error(error);
      addToast("Ocorreu um erro ao buscar o produto.", "error");
      router.push("/reseller/products");
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Calcular comissão
  const calculateCommission = (price: number, commissionPercentage: number) => {
    return (price * commissionPercentage) / 100;
  };

  if (!user || user.type !== "revendedor") {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            Produto não encontrado ou você não tem permissão para visualizá-lo.
          </div>
          <Link
            href="/reseller/products"
            className="text-primary hover:text-primary-hover"
          >
            Voltar para a lista de produtos
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Link href="/reseller/products" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{product.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fornecido por {product.supplierName}
            </p>
          </div>
        </div>

        {/* Galeria de imagens */}
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="relative aspect-square">
                <ImageFallback
                  src={product.imageUrls[currentImageIndex] || "https://via.placeholder.com/500x500?text=" + encodeURIComponent(product.name)}
                  alt={product.name}
                  className="w-full h-full"
                />
                {product.featured && (
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-md">
                    Destaque
                  </div>
                )}
              </div>
            </div>
            
            {/* Miniaturas */}
            {product.imageUrls.length > 1 && (
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {product.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      currentImageIndex === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <ImageFallback
                      src={url}
                    alt={`${product.name} - Imagem ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do produto */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatPrice(product.price)}
                </h2>
                {product.commission !== undefined && (
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-md flex items-center">
                    <FiDollarSign className="mr-1" />
                    <span>
                      Comissão: {formatPrice(calculateCommission(product.price, product.commission))} ({product.commission}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Descrição
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {product.description || "Sem descrição disponível."}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-2">
                  <FiTag className="mr-2 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Categoria
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-2">
                  <FiUser className="mr-2 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Público-alvo
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.targetAudiences.map((audience) => (
                    <span
                      key={audience}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Tamanhos disponíveis
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-sm"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Fornecedor
                </h3>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {product.supplierName?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.supplierName}
                    </div>
                    <Link
                      href={`/reseller/products?supplierId=${product.supplierId}`}
                      className="text-xs text-primary hover:text-primary-hover"
                    >
                      Ver todos os produtos deste fornecedor
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Ações
              </h3>
              <div className="flex flex-col space-y-3">
                <button
                  className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                >
                  <FiShoppingBag className="mr-2" />
                  Adicionar à minha loja
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Ao adicionar este produto à sua loja, você poderá revendê-lo e ganhar comissão sobre as vendas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}