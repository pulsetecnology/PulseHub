'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNextAuth } from '@/hooks/useNextAuth';
import MainLayout from '@/layouts/MainLayout';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiTag, FiAlertCircle, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import { SIZE_TYPES, getSizeTypeById, SizeOption } from '@/types/sizes';

interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  supplierId?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const { user } = useNextAuth();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    sizeType: '',
    customSizes: [] as SizeOption[],
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    slug: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login?type=fornecedor');
    } else if (user.type !== 'fornecedor') {
      router.push('/');
    } else {
      fetchCategories();
    }
  }, [user, router]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/categories?supplierId=${user?.id || ''}`);
      if (!res.ok) throw new Error('Falha ao buscar categorias');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
      addToast('Ocorreu um erro ao buscar as categorias.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      sizeType: '',
      customSizes: [],
    });
    setFormErrors({
      name: '',
      slug: '',
    });
    setShowAddModal(true);
  };

  const handleEditCategory = (category: any) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      sizeType: category.sizeType || '',
      customSizes: category.customSizes ? JSON.parse(category.customSizes) : [],
    });
    setFormErrors({
      name: '',
      slug: '',
    });
    setShowEditModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  const validateForm = () => {
    const errors = {
      name: '',
      slug: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug é obrigatório';
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generate slug from name if slug field is empty
    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          supplierId: user?.id,
          customSizes: formData.sizeType === 'custom' ? formData.customSizes : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao criar categoria');
      }

      addToast('Categoria criada com sucesso!', 'success');
      setShowAddModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Ocorreu um erro ao criar a categoria.', 'error');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentCategory) return;

    try {
      const res = await fetch(`/api/categories/${currentCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customSizes: formData.sizeType === 'custom' ? formData.customSizes : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao atualizar categoria');
      }

      addToast('Categoria atualizada com sucesso!', 'success');
      setShowEditModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Ocorreu um erro ao atualizar a categoria.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentCategory) return;

    try {
      const res = await fetch(`/api/categories/${currentCategory.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao excluir categoria');
      }

      addToast('Categoria excluída com sucesso!', 'success');
      setShowDeleteModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Ocorreu um erro ao excluir a categoria.', 'error');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.type !== 'fornecedor') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Categorias</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie as categorias dos seus produtos
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <FiPlus className="mr-2" />
            Nova Categoria
          </button>
        </div>

        {/* Barra de busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg flex items-center">
            <span className="text-blue-700 dark:text-blue-300 text-sm">
              {filteredCategories.length} categorias encontradas
            </span>
          </div>
        </div>

        {/* Lista de categorias */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'Nenhuma categoria encontrada com este termo.' : 'Nenhuma categoria cadastrada.'}
            </div>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Adicionar Categoria
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Produtos
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center">
                            <FiTag className="text-primary" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {category.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {category._count?.products || 0} produtos
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            disabled={(category._count?.products || 0) > 0}
                            title={(category._count?.products || 0) > 0 ? 'Não é possível excluir categorias com produtos' : 'Excluir categoria'}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de adicionar categoria */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nova Categoria</h3>
              <form onSubmit={handleSubmitAdd}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome*
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Ex: Roupas"
                      required
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" /> {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slug*
                    </label>
                    <input
                      id="slug"
                      name="slug"
                      type="text"
                      value={formData.slug}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.slug ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Ex: roupas"
                      required
                    />
                    {formErrors.slug && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" /> {formErrors.slug}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      O slug é usado em URLs e deve conter apenas letras minúsculas, números e hífens.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="sizeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Tamanho*
                    </label>
                    <select
                      id="sizeType"
                      name="sizeType"
                      value={formData.sizeType}
                      onChange={(e) => setFormData(prev => ({ ...prev, sizeType: e.target.value, customSizes: [] }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Selecione um tipo de tamanho</option>
                      {SIZE_TYPES.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {formData.sizeType && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {getSizeTypeById(formData.sizeType)?.description}
                      </p>
                    )}
                  </div>

                  {/* Campo para tamanhos personalizados */}
                  {formData.sizeType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tamanhos Personalizados*
                      </label>
                      <div className="space-y-2">
                        {formData.customSizes.map((size, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Rótulo (ex: PP)"
                              value={size.label}
                              onChange={(e) => {
                                const newSizes = [...formData.customSizes];
                                newSizes[index] = { ...size, label: e.target.value, value: e.target.value.toLowerCase() };
                                setFormData(prev => ({ ...prev, customSizes: newSizes }));
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newSizes = formData.customSizes.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, customSizes: newSizes }));
                              }}
                              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              customSizes: [...prev.customSizes, { label: '', value: '' }]
                            }));
                          }}
                          className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 hover:border-primary hover:text-primary"
                        >
                          + Adicionar Tamanho
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Descrição da categoria (opcional)"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de editar categoria */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Editar Categoria</h3>
              <form onSubmit={handleSubmitEdit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome*
                    </label>
                    <input
                      id="edit-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      required
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" /> {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="edit-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slug*
                    </label>
                    <input
                      id="edit-slug"
                      name="slug"
                      type="text"
                      value={formData.slug}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.slug ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      required
                    />
                    {formErrors.slug && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <FiAlertCircle className="mr-1" /> {formErrors.slug}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="edit-sizeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Tamanho*
                    </label>
                    <select
                      id="edit-sizeType"
                      name="sizeType"
                      value={formData.sizeType}
                      onChange={(e) => setFormData(prev => ({ ...prev, sizeType: e.target.value, customSizes: e.target.value === 'custom' ? prev.customSizes : [] }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Selecione um tipo de tamanho</option>
                      {SIZE_TYPES.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {formData.sizeType && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {getSizeTypeById(formData.sizeType)?.description}
                      </p>
                    )}
                  </div>

                  {/* Campo para tamanhos personalizados na edição */}
                  {formData.sizeType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tamanhos Personalizados*
                      </label>
                      <div className="space-y-2">
                        {formData.customSizes.map((size, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Rótulo (ex: PP)"
                              value={size.label}
                              onChange={(e) => {
                                const newSizes = [...formData.customSizes];
                                newSizes[index] = { ...size, label: e.target.value, value: e.target.value.toLowerCase() };
                                setFormData(prev => ({ ...prev, customSizes: newSizes }));
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newSizes = formData.customSizes.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, customSizes: newSizes }));
                              }}
                              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              customSizes: [...prev.customSizes, { label: '', value: '' }]
                            }));
                          }}
                          className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 hover:border-primary hover:text-primary"
                        >
                          + Adicionar Tamanho
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmação de exclusão */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
              <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tem certeza que deseja excluir a categoria <strong>{currentCategory?.name}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informações sobre categorias */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Sobre as Categorias</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              <strong>O que são categorias?</strong> Categorias são usadas para organizar seus produtos e facilitar a navegação dos revendedores.
            </p>
            <p>
              <strong>Como adicionar uma categoria?</strong> Clique no botão "Nova Categoria" acima e preencha o formulário com os dados da categoria.
            </p>
            <p>
              <strong>O que é um slug?</strong> O slug é uma versão simplificada do nome da categoria, usado em URLs. Por exemplo, a categoria "Roupas Femininas" teria o slug "roupas-femininas".
            </p>
            <p>
              <strong>Posso excluir uma categoria?</strong> Você só pode excluir categorias que não possuem produtos associados. Para excluir uma categoria com produtos, primeiro mova os produtos para outra categoria.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}