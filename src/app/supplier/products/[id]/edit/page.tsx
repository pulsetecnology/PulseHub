'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNextAuth } from '@/hooks/useNextAuth';
import MainLayout from '@/layouts/MainLayout';
import { FiArrowLeft, FiUpload, FiX, FiAlertCircle, FiTrash2, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import { DEFAULT_TARGET_AUDIENCES } from '@/types/product';
import { getSizesByType } from '@/types/sizes';
import InputBRL from '@/components/forms/InputBRL';
import { Product } from '@/types/product';
import { useToast } from '@/contexts/ToastContext';

type ValidationErrors = {
  name?: string;
  price?: string;
  category?: string;
  sizes?: string;
  targetAudiences?: string;
  images?: string;
};

// Interface para categoria
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sizeType?: string;
  customSizes?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const { user } = useNextAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Produto não encontrado');
        const product: Product = await res.json();
        
        // Garantir que imageUrls seja sempre um array
        const imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls : [];
        
        setFormData({
          ...product,
          sizes: product.sizes || [],
          targetAudiences: product.targetAudiences || [],
          price: product.price.toString(),
        });
        setImagePreviewUrls(imageUrls);
      } catch (error) {
        console.error(error);
        addToast('Produto não encontrado', "error");
        router.push('/supplier/products');
      }
    };

    fetchProduct();
  }, [productId, router, addToast]);

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome do produto é obrigatório';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Preço deve ser maior que zero';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!Array.isArray(formData.sizes) || formData.sizes.length === 0) newErrors.sizes = 'Selecione pelo menos um tamanho';
    if (!Array.isArray(formData.targetAudiences) || formData.targetAudiences.length === 0) newErrors.targetAudiences = 'Selecione pelo menos um público-alvo';
    if (!Array.isArray(imagePreviewUrls) || imagePreviewUrls.length === 0) newErrors.images = 'Adicione pelo menos uma imagem';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Criar uma cópia limpa dos dados para enviar à API
      const data = {
        ...formData,
        // Garantir que os arrays sejam tratados corretamente
        sizes: Array.isArray(formData.sizes) ? formData.sizes.join(',') : '',
        targetAudiences: Array.isArray(formData.targetAudiences) ? formData.targetAudiences.join(',') : '',
        imageUrls: Array.isArray(imagePreviewUrls) ? imagePreviewUrls.join('[IMAGE]') : '',
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Falha ao atualizar o produto');

      addToast('Produto atualizado com sucesso!', "success");
      router.push('/supplier/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      addToast('Ocorreu um erro ao salvar o produto.', "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    setIsLoading(true);
    try {
      // Simulate API call for deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app: const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      // if (!res.ok) throw new Error('Falha ao excluir o produto');

      addToast('Produto excluído com sucesso!', "success");
      router.push('/supplier/products'); // Redirect to product list
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      addToast('Ocorreu um erro ao excluir o produto.', "error");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleToggle = (field: 'sizes' | 'targetAudiences', value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => {
      if (!prev) return prev;
      const currentItems = Array.isArray(prev[field]) ? prev[field] : [];
      const items = currentItems.includes(value)
        ? currentItems.filter((i: string) => i !== value)
        : [...currentItems, value];
      return { ...prev, [field]: items };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const base64Promises = files.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      }));
      const newPreviews = await Promise.all(base64Promises);
      setImagePreviewUrls(prev => [...prev, ...newPreviews].slice(0, 10));
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  if (!formData) return <MainLayout><p>Carregando...</p></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/supplier/products" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Editar Produto</h1>
            <p className="text-gray-600 dark:text-gray-400">Atualize as informações do seu produto.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... (restante do formulário idêntico ao de adicionar produto) ... */}
            {/* Name, Price, Description, Category, Sizes, Target Audiences, Images, Featured, Buttons */}
            
            {/* Informações básicas */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
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
                    onChange={(value) => setFormData((prev: any) => ({ ...prev, price: value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, price: true }))}
                    className={`w-full px-4 py-2 border ${
                      errors.price && touched.price 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary'
                    } rounded-md focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    required
                  />
                  {errors.price && touched.price && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.price}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="commission" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comissão do Produto (%)*
                  </label>
                  <input
                    id="commission"
                    name="commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commission || 10}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Comissão padrão para este produto. Pode ser sobrescrita pela comissão do revendedor.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
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
                    onBlur={() => setTouched(prev => ({ ...prev, category: true }))}
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
                  {errors.category && touched.category && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.category}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Link href="/supplier/categories" className="text-primary hover:underline flex items-center">
                      <FiPlus size={14} className="mr-1" /> Gerenciar categorias
                    </Link>
                  </div>
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
                        onClick={() => handleToggle('targetAudiences', audience.id)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          formData.targetAudiences?.includes(audience.id)
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
                            onClick={() => handleToggle('sizes', size.value)}
                            className={`px-3 py-1 text-sm rounded-full ${
                              formData.sizes?.includes(size.value)
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
                              onClick={() => handleToggle('sizes', size)}
                              className={`px-3 py-1 text-sm rounded-full ${
                                formData.sizes?.includes(size)
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

            {/* Lógica de Imagens */}
            <div>
              <h2 className="text-xl font-semibold">Imagens</h2>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {Array.isArray(imagePreviewUrls) && imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-auto rounded-md" />
                    <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {Array.isArray(imagePreviewUrls) && imagePreviewUrls.length < 10 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <FiUpload className="mx-auto text-gray-400" size={32} />
                    <p>Adicionar Imagem</p>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                )}
              </div>
               {errors.images && touched.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                disabled={isLoading}
              >
                <FiTrash2 className="inline-block mr-2" /> Excluir Produto
              </button>
              <Link href="/supplier/products" className="px-4 py-2 border rounded-md">Cancelar</Link>
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50">
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
