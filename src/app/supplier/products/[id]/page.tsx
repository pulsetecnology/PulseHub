"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiArrowLeft, FiEdit, FiTrash2, FiStar, FiTag, FiPackage, FiDollarSign, FiCalendar } from "react-icons/fi";
import Link from "next/link";
import { Product } from "@/types/product";

// Dados mockados para demonstração
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Camiseta Básica",
    description: "Camiseta 100% algodão, corte regular, gola redonda. Peça versátil e confortável para o dia a dia. Disponível em várias cores e tamanhos.",
    price: 49.90,
    imageUrls: [
      "https://via.placeholder.com/800x600?text=Camiseta+Frente",
      "https://via.placeholder.com/800x600?text=Camiseta+Costas",
      "https://via.placeholder.com/800x600?text=Camiseta+Detalhe"
    ],
    sizes: ["P", "M", "G"],
    featured: false,
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-06-10"),
  },
  {
    id: 2,
    name: "Calça Jeans",
    description: "Calça jeans slim fit, 98% algodão e 2% elastano. Confortável e durável, ideal para uso casual.",
    price: 129.90,
    imageUrls: [
      "https://via.placeholder.com/800x600?text=Calça+Frente",
      "https://via.placeholder.com/800x600?text=Calça+Costas"
    ],
    sizes: ["38", "40", "42"],
    featured: true,
    createdAt: new Date("2023-04-20"),
    updatedAt: new Date("2023-06-05"),
  },
];

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const { user } = useNextAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Carregar dados do produto
  useEffect(() => {
    // Simulação de busca de produto por ID
    const foundProduct = mockProducts.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      if (foundProduct.imageUrls && foundProduct.imageUrls.length > 0) {
        setSelectedImage(foundProduct.imageUrls[0]);
      }
    } else {
      // Produto não encontrado
      alert("Produto não encontrado");
      router.push("/supplier/products");
    }
  }, [productId, router]);

  const handleDeleteProduct = () => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      // Simulação de exclusão
      alert("Produto excluído com sucesso!");
      router.push("/supplier/products");
    }
  };

  const handleToggleFeatured = () => {
    if (product) {
      setProduct({
        ...product,
        featured: !product.featured
      });
      // Simulação de atualização
      alert(product.featured ? "Produto removido dos destaques!" : "Produto adicionado aos destaques!");
    }
  };

  if (!user || user.type !== "fornecedor" || !product) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/supplier/products" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{product.name}</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleToggleFeatured}
              className={`p-2 rounded-full ${
                product.featured
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
              title={product.featured ? "Remover destaque" : "Destacar produto"}
            >
              <FiStar size={20} />
            </button>
            <Link href={`/supplier/products/${product.id}/edit`}>
              <button className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <FiEdit size={20} />
              </button>
            </Link>
            <button
              onClick={handleDeleteProduct}
              className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            >
              <FiTrash2 size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de imagens */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="relative aspect-square">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
            
            {/* Miniaturas */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(url)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      selectedImage === url
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} - Imagem ${index + 1}`}
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </h2>
                  {product.featured && (
                    <span className="bg-yellow-400 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      Destaque
                    </span>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Descrição</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {product.description || "Sem descrição disponível."}
                  </p>
                </div>
                
                {product.sizes && product.sizes.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Tamanhos disponíveis</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <span
                          key={size}
                          className="inline-block px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Informações adicionais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                        <FiTag size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Categoria</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Roupas</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
                        <FiPackage size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Estoque</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Disponível</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
                        <FiDollarSign size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Comissão padrão</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">10%</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mr-3">
                        <FiCalendar size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Cadastrado em</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {product.createdAt?.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Visibilidade para revendedores</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                Este produto está visível para todos os seus revendedores aprovados. Eles poderão visualizar as informações e solicitar orçamentos.
              </p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Gerenciar visibilidade
                </button>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30">
                  Ver como revendedor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}