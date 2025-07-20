"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiArrowLeft, FiUpload, FiX, FiAlertCircle, FiPlus } from "react-icons/fi";
import Link from "next/link";
import { DEFAULT_TARGET_AUDIENCES } from "@/types/product";
import { getSizesByType } from "@/types/sizes";

import InputBRL from "@/components/forms/InputBRL";
import ProductSuccessPage from "@/components/ProductSuccessPage";

// Função para converter um arquivo para base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Definição de tipos para validação
type ValidationErrors = {
  name?: string;
  price?: string;
  category?: string;
  sizes?: string;
  targetAudiences?: string;
  images?: string;
};

import { useToast } from "@/contexts/ToastContext";

// Interface para categoria
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sizeType?: string;
  customSizes?: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useNextAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sizes: [] as string[],
    targetAudiences: [] as string[],
    featured: false,
  });
  
  // Estado para armazenar as imagens
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estado para validação em tempo real
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Estado para controlar o sucesso do cadastro
  const [isSuccess, setIsSuccess] = useState(false);
  const [newProductId, setNewProductId] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para validar o formulário
  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome do produto é obrigatório";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }
    
    if (!formData.price) {
      newErrors.price = "Preço é obrigatório";
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = "Preço deve ser maior que zero";
    }
    
    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória";
    }
    
    if (formData.sizes.length === 0) {
      newErrors.sizes = "Selecione pelo menos um tamanho";
    }
    
    if (formData.targetAudiences.length === 0) {
      newErrors.targetAudiences = "Selecione pelo menos um público-alvo";
    }
    
    if (imageFiles.length === 0) {
      newErrors.images = "Adicione pelo menos uma imagem";
    }
    
    return newErrors;
  };

  // Carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/categories?supplierId=${user?.id || ''}`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    if (user?.id) {
      fetchCategories();
    }
  }, [user]);

  // Validar quando os campos são alterados
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors = validateForm();
      setErrors(newErrors);
    }
  }, [formData, imageFiles, touched]);

  // Função para marcar um campo como tocado
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('sizes', formData.sizes.join(','));
    data.append('targetAudiences', formData.targetAudiences.join(','));
    data.append('featured', formData.featured.toString());
    data.append('supplierId', user?.id || '');
    data.append('supplierName', user?.name || '');
    imageFiles.forEach(file => {
      data.append('images', file);
    });

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        throw new Error('Falha ao criar o produto');
      }

      const newProduct = await res.json();
      setNewProductId(newProduct.id);
      setIsSuccess(true);

    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      addToast("Ocorreu um erro ao salvar o produto. Por favor, tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
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
    setTouched(prev => ({ ...prev, sizes: true }));
    
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
    setTouched(prev => ({ ...prev, targetAudiences: true }));
    
    setFormData(prev => {
      const audiences = [...prev.targetAudiences];
      if (audiences.includes(audienceId)) {
        return { ...prev, targetAudiences: audiences.filter(a => a !== audienceId) };
      } else {
        return { ...prev, targetAudiences: [...audiences, audienceId] };
      }
    });
  };

  // Função para lidar com upload de imagens
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, images: true }));
    
    if (e.target.files && e.target.files.length > 0) {
      // Calcular quantas imagens ainda podem ser adicionadas
      const remainingSlots = 10 - imageFiles.length;
      
      if (remainingSlots <= 0) {
        addToast("Você já atingiu o limite de 10 imagens.", "info");
        e.target.value = '';
        return;
      }
      
      const filesToAdd = Array.from(e.target.files).slice(0, remainingSlots);
      
      // Validar tamanho e tipo de arquivo
      const validFiles = filesToAdd.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        
        if (!isValidType) {
          addToast(`O arquivo "${file.name}" não é um formato de imagem válido. Use JPG, PNG ou WEBP.`, "error");
        }
        
        if (!isValidSize) {
          addToast(`O arquivo "${file.name}" excede o tamanho máximo de 5MB.`, "error");
        }
        
        return isValidType && isValidSize;
      });
      
      if (validFiles.length === 0) {
        e.target.value = '';
        return;
      }
      
      // Gerar previews
      const newPreviews = await Promise.all(
        validFiles.map(async (file) => {
          try {
            return await fileToBase64(file);
          } catch (error) {
            console.error("Erro ao gerar preview:", error);
            return null;
          }
        })
      );
      
      // Filtrar previews nulos
      const validPreviews = newPreviews.filter(preview => preview !== null) as string[];
      
      // Atualizar estados
      setImagePreviewUrls(prev => [...prev, ...validPreviews]);
      setImageFiles(prev => [...prev, ...validFiles]);
      
      // Limpar input
      e.target.value = '';
    }
  };

  // Função para remover uma imagem
  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setImagePreviewUrls(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  // Se o usuário não for fornecedor, não renderizar nada
  if (!user || user.type !== "fornecedor") {
    return null;
  }

  // Se o cadastro foi bem-sucedido, mostrar a página de sucesso
  if (isSuccess) {
    return (
      <MainLayout>
        <ProductSuccessPage productId={newProductId} />
      </MainLayout>
    );
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
                    onBlur={() => handleBlur('name')}
                    className={`w-full px-4 py-2 border ${
                      errors.name && touched.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary'
                    } rounded-md focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Ex: Camiseta Básica"
                    required
                  />
                  {errors.name && touched.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preço (R$)*
                  </label>
                  <InputBRL
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, price: value }));
                      setTouched(prev => ({ ...prev, price: true }));
                    }}
                    onBlur={() => handleBlur('price')}
                    className={`w-full px-4 py-2 border ${
                      errors.price && touched.price 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary'
                    } rounded-md focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="R$ 0,00"
                    required
                  />
                  {errors.price && touched.price && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.price}
                    </p>
                  )}
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
                    onBlur={() => handleBlur('category')}
                    className={`w-full px-4 py-2 border ${
                      errors.category && touched.category 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary'
                    } rounded-md focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="roupas">Roupas</option>
                        <option value="calcados">Calçados</option>
                        <option value="acessorios">Acessórios</option>
                        <option value="infantil">Infantil</option>
                      </>
                    )}
                  </select>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Link href="/supplier/categories" className="text-primary hover:underline flex items-center">
                      <FiPlus size={14} className="mr-1" /> Gerenciar categorias
                    </Link>
                  </div>
                  {errors.category && touched.category && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.category}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Público-alvo*
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
                  {errors.targetAudiences && touched.targetAudiences && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.targetAudiences}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tamanhos disponíveis*
                </label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    if (!formData.category) {
                      return (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Selecione uma categoria para ver os tamanhos disponíveis
                        </p>
                      );
                    }

                    // Encontrar a categoria selecionada
                    const selectedCategory = categories.find(cat => cat.slug === formData.category);
                    
                    if (selectedCategory && selectedCategory.sizeType) {
                      // Usar tamanhos da categoria
                      const availableSizes = getSizesByType(selectedCategory.sizeType, selectedCategory.customSizes);
                      
                      if (availableSizes.length > 0) {
                        return availableSizes.map(size => (
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
                        ));
                      }
                    }

                    // Fallback para categorias antigas sem tipo de tamanho definido
                    return (
                      <div className="w-full">
                        <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                          Esta categoria não tem tipos de tamanho definidos. 
                          <Link href="/supplier/categories" className="text-primary hover:underline ml-1">
                            Clique aqui para configurar
                          </Link>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Usando tamanhos padrão temporariamente
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['PP', 'P', 'M', 'G', 'GG'].map(size => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleSizeToggle(size)}
                              className={`px-3 py-1 text-sm rounded-full ${
                                formData.sizes.includes(size)
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                {errors.sizes && touched.sizes && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.sizes}
                  </p>
                )}
              </div>
            </div>

            {/* Imagens */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Imagens do Produto*</h2>
              <div className="mb-2 flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adicione até 10 imagens do seu produto
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {imageFiles.length}/10 imagens
                </span>
              </div>
              
              {/* Upload de imagens - apenas se houver menos de 10 imagens */}
              {imageFiles.length < 10 && (
                <div 
                  className={`border-2 border-dashed ${
                    errors.images && touched.images 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors`}
                  onClick={() => fileInputRef.current?.click()}
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
                      ref={fileInputRef}
                      id="product-images"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Selecionar Imagens
                    </button>
                  </div>
                </div>
              )}
              
              {errors.images && touched.images && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.images}
                </p>
              )}
              
              {/* Prévia das imagens selecionadas */}
              {imagePreviewUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagens selecionadas
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 group">
                        <img
                          src={url}
                          alt={`Imagem ${index + 1} do produto`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                            title="Remover imagem"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <FiX size={16} />
                          </button>
                        </div>
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
                disabled={isLoading || isUploading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 flex items-center"
              >
                {isLoading || isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isUploading ? `Enviando imagens (${uploadProgress}%)` : "Salvando..."}
                  </>
                ) : (
                  "Salvar Produto"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}