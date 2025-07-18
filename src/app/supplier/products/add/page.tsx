"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import Link from "next/link";
import { DEFAULT_TARGET_AUDIENCES, DEFAULT_SIZES } from "@/types/product";
import { addProduct, saveProductImages } from "@/lib/db";
import InputBRL from "@/components/forms/InputBRL";

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useNextAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sizes: [] as string[],
    targetAudiences: [] as string[],
    featured: false,
  });
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função placeholder para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de envio para API
    setTimeout(() => {
      setIsLoading(false);
      alert("Produto adicionado com sucesso!");
      router.push("/supplier/products");
    }, 1500);
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Função para lidar com seleção de tamanhos
  const handleSizeToggle = (size: string) => {
    setFormData(prev => {
      const sizes = [...prev.sizes];
      if (sizes.includes(size)) {
        return { ...prev, sizes: sizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...sizes, size] };
      }
    });
  };

  // Função para lidar com seleção de público-alvo
  const handleTargetAudienceToggle = (audienceId: string) => {
    setFormData(prev => {
      const audiences = [...prev.targetAudiences];
      if (audiences.includes(audienceId)) {
        return { ...prev, targetAudiences: audiences.filter(a => a !== audienceId) };
      } else {
        return { ...prev, targetAudiences: [...audiences, audienceId] };
      }
    });
  };

  if (!user || user.type !== "fornecedor") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/supplier/products" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Adicionar Produto</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Cadastre um novo produto no seu catálogo
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações básicas */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome do produto*
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ex: Camiseta Básica"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preço (R$)*
                  </label>
                  <InputBRL
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="R$ 0,00"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Descreva o produto em detalhes..."
                />
              </div>
            </div>

            {/* Categoria e Tamanhos */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Categoria e Tamanhos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="roupas">Roupas</option>
                    <option value="calcados">Calçados</option>
                    <option value="acessorios">Acessórios</option>
                    <option value="infantil">Infantil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Público-alvo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_TARGET_AUDIENCES.map(audience => (
                      <button
                        key={audience.id}
                        type="button"
                        onClick={() => handleTargetAudienceToggle(audience.id)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          formData.targetAudiences.includes(audience.id)
                            ? "bg-primary text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {audience.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tamanhos disponíveis
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.category && DEFAULT_SIZES[formData.category as keyof typeof DEFAULT_SIZES] ? (
                    DEFAULT_SIZES[formData.category as keyof typeof DEFAULT_SIZES].map(size => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => handleSizeToggle(size.value)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          formData.sizes.includes(size.value)
                            ? "bg-primary text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {size.label}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Selecione uma categoria para ver os tamanhos disponíveis
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Imagens */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Imagens do Produto</h2>
              <div className="mb-2 flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adicione até 10 imagens do seu produto
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {productImages.length}/10 imagens
                </span>
              </div>
              
              {/* Upload de imagens - apenas se houver menos de 10 imagens */}
              {productImages.length < 10 && (
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  onClick={() => document.getElementById('product-images')?.click()}
                >
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 mb-2" size={32} />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Arraste e solte imagens aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Formatos aceitos: JPG, PNG, WEBP. Máximo 5MB por imagem.
                    </p>
                    <input
                      id="product-images"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        // Verificar se há arquivos selecionados
                        if (e.target.files && e.target.files.length > 0) {
                          // Calcular quantas imagens ainda podem ser adicionadas
                          const remainingSlots = 10 - productImages.length;
                          
                          if (remainingSlots <= 0) {
                            alert("Você já atingiu o limite de 10 imagens.");
                            e.target.value = '';
                            return;
                          }
                          
                          const filesToAdd = Array.from(e.target.files).slice(0, remainingSlots);
                          
                          // Simular o processamento dos arquivos
                          const newImageUrls = [...productImages];
                          
                          // Para demonstração, vamos adicionar URLs de placeholder
                          filesToAdd.forEach((file, index) => {
                            // Em uma implementação real, você faria upload para um serviço como Cloudinary
                            // e adicionaria as URLs retornadas
                            newImageUrls.push(`https://via.placeholder.com/500x500?text=Nova+Imagem+${productImages.length + index + 1}`);
                          });
                          
                          // Atualizar o estado com as novas imagens
                          setProductImages(newImageUrls);
                          
                          // Limpar o input para permitir selecionar os mesmos arquivos novamente
                          e.target.value = '';
                          
                          console.log(`${filesToAdd.length} imagens adicionadas`);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('product-images')?.click();
                      }}
                    >
                      Selecionar Imagens
                    </button>
                  </div>
                </div>
              )}
              
              {/* Prévia das imagens selecionadas */}
              {productImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagens selecionadas
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {productImages.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={url}
                          alt={`Imagem ${index + 1} do produto`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          title="Remover imagem"
                          onClick={() => {
                            const newImages = [...productImages];
                            newImages.splice(index, 1);
                            setProductImages(newImages);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Opções adicionais */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Opções Adicionais</h2>
              <div className="flex items-center">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Marcar como produto em destaque
                </label>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/supplier/products"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
              >
                {isLoading ? "Salvando..." : "Salvar Produto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}