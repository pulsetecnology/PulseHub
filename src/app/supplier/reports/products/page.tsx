'use client';

import MainLayout from '@/layouts/MainLayout';
import { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

import { useToast } from '@/contexts/ToastContext';

const mockProductData = [
  { id: 'P001', name: 'Camiseta Básica', category: 'Roupas', salesCount: 150, revenue: 7485.00, status: 'Ativo' },
  { id: 'P002', name: 'Calça Jeans Slim', category: 'Roupas', salesCount: 80, revenue: 10392.00, status: 'Ativo' },
  { id: 'P003', name: 'Tênis Esportivo', category: 'Calçados', salesCount: 120, revenue: 18000.00, status: 'Ativo' },
  { id: 'P004', name: 'Bolsa de Couro', category: 'Acessórios', salesCount: 30, revenue: 4500.00, status: 'Inativo' },
  { id: 'P005', name: 'Vestido de Verão', category: 'Roupas', salesCount: 95, revenue: 14250.00, status: 'Ativo' },
];

export default function ProductReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { addToast } = useToast();

  const handleExportPdf = () => {
    addToast('Gerando PDF do relatório de produtos...', 'info');
    // Simulate PDF generation and download
    setTimeout(() => {
      addToast('PDF do relatório de produtos gerado com sucesso!', 'success');
    }, 1500);
  };

  const handleExportExcel = () => {
    addToast('Gerando Excel do relatório de produtos...', 'info');
    // Simulate Excel generation and download
    setTimeout(() => {
      addToast('Excel do relatório de produtos gerado com sucesso!', 'success');
    }, 1500);
  };

  const filteredProducts = mockProductData.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || product.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || product.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => b.salesCount - a.salesCount);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Relatório de Produtos</h1>
        <p className="text-gray-600 dark:text-gray-400">Analise o desempenho dos seus produtos.</p>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="relative flex-1 min-w-[150px]">
              <FiFilter className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Todas as Categorias</option>
                <option value="roupas">Roupas</option>
                <option value="calcados">Calçados</option>
                <option value="acessorios">Acessórios</option>
              </select>
            </div>
            <div className="relative flex-1 min-w-[150px]">
              <FiFilter className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID do Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome do Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vendas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Receita</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                      Nenhum produto encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{product.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{product.salesCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{product.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{product.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}