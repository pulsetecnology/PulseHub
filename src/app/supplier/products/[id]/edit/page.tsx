'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNextAuth } from '@/hooks/useNextAuth';
import MainLayout from '@/layouts/MainLayout';
import { FiArrowLeft, FiUpload, FiX, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { DEFAULT_TARGET_AUDIENCES, DEFAULT_SIZES } from '@/types/product';
import InputBRL from '@/components/forms/InputBRL';
import { DbProduct } from '@/types/product';
import { useToast } from '@/contexts/ToastContext';

type ValidationErrors = {
  name?: string;
  price?: string;
  category?: string;
  sizes?: string;
  targetAudiences?: string;
  images?: string;
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Produto não encontrado');
        const product: DbProduct = await res.json();
        setFormData({
          ...product,
          sizes: product.sizes ? product.sizes.split(',') : [],
          targetAudiences: product.targetAudiences ? product.targetAudiences.split(',') : [],
          price: product.price.toString(),
        });
        setImagePreviewUrls(product.imageUrls ? product.imageUrls.split('[IMAGE]') : []);
      } catch (error) {
        console.error(error);
        addToast('Produto não encontrado', "error");
        router.push('/supplier/dashboard');
      }
    };

    fetchProduct();
  }, [productId, router]);

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome do produto é obrigatório';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Preço deve ser maior que zero';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (formData.sizes.length === 0) newErrors.sizes = 'Selecione pelo menos um tamanho';
    if (formData.targetAudiences.length === 0) newErrors.targetAudiences = 'Selecione pelo menos um público-alvo';
    if (imagePreviewUrls.length === 0) newErrors.images = 'Adicione pelo menos uma imagem';
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
      const data = { ...formData };
      data.sizes = data.sizes.join(',');
      data.targetAudiences = data.targetAudiences.join(',');
      data.imageUrls = imagePreviewUrls.join('[IMAGE]');

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Falha ao atualizar o produto');

      addToast('Produto atualizado com sucesso!', "success");
      router.push('/supplier/dashboard');
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
    setFormData((prev: any) => {
      const items = prev[field].includes(value)
        ? prev[field].filter((i: string) => i !== value)
        : [...prev[field], value];
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
          <Link href="/supplier/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
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
            
            {/* Exemplo do campo de preço usando InputBRL */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço (R$)*</label>
              <InputBRL
                id="price"
                name="price"
                value={formData.price}
                onChange={(value) => setFormData((prev: any) => ({ ...prev, price: value }))}
                onBlur={() => setTouched(prev => ({ ...prev, price: true }))}
                className={`w-full px-4 py-2 border ${errors.price && touched.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
              />
              {errors.price && touched.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>

            {/* Lógica de Imagens */}
            <div>
              <h2 className="text-xl font-semibold">Imagens</h2>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-auto rounded-md" />
                    <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {imagePreviewUrls.length < 10 && (
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
              <Link href="/supplier/dashboard" className="px-4 py-2 border rounded-md">Cancelar</Link>
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
