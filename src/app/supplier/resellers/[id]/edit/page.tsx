'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/layouts/MainLayout';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

export default function EditResellerPage() {
  const router = useRouter();
  const params = useParams();
  const resellerId = params.id as string;
  const { addToast } = useToast();

  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    // Simulate fetching reseller data
    const fetchReseller = async () => {
      try {
        // In a real app, fetch from API: const res = await fetch(`/api/resellers/${resellerId}`);
        // const data = await res.json();
        const mockReseller = {
          id: resellerId,
          name: 'Revendedor Exemplo',
          email: 'revendedor.exemplo@email.com',
          phone: '(11) 99999-9999',
          accessLevel: 'standard',
          isActive: true,
        };
        setFormData(mockReseller);
      } catch (error) {
        console.error('Error fetching reseller:', error);
        addToast('Erro ao carregar dados do revendedor.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (resellerId) {
      fetchReseller();
    }
  }, [resellerId, addToast]);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = 'Email inválido';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      addToast('Por favor, corrija os erros no formulário.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, send data to API: const res = await fetch(`/api/resellers/${resellerId}`, { method: 'PUT', body: JSON.stringify(formData) });
      // if (!res.ok) throw new Error('Failed to update reseller');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      addToast('Revendedor atualizado com sucesso!', 'success');
      router.push('/supplier/resellers');
    } catch (error: any) {
      console.error('Error saving reseller:', error);
      addToast(error.message || 'Erro ao salvar revendedor.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <p>Carregando...</p>
      </MainLayout>
    );
  }

  if (!formData) {
    return (
      <MainLayout>
        <p>Revendedor não encontrado.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/supplier/resellers" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Editar Revendedor</h1>
            <p className="text-gray-600 dark:text-gray-400">Atualize as informações do revendedor.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500 flex items-center"><FiAlertCircle className="mr-1"/>{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500 flex items-center"><FiAlertCircle className="mr-1"/>{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nível de Acesso</label>
              <select
                id="accessLevel"
                name="accessLevel"
                value={formData.accessLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="standard">Padrão</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Revendedor Ativo</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Link href="/supplier/resellers" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
