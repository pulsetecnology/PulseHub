'use client';

import MainLayout from '@/layouts/MainLayout';
import { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

import { useToast } from '@/contexts/ToastContext';

const mockResellerData = [
  { id: 'R001', name: 'Revendedor Alpha', email: 'alpha@example.com', totalOrders: 50, totalRevenue: 25000.00, status: 'Ativo' },
  { id: 'R002', name: 'Revendedor Beta', email: 'beta@example.com', totalOrders: 30, totalRevenue: 15000.00, status: 'Ativo' },
  { id: 'R003', name: 'Revendedor Gamma', email: 'gamma@example.com', totalOrders: 10, totalRevenue: 5000.00, status: 'Inativo' },
  { id: 'R004', name: 'Revendedor Delta', email: 'delta@example.com', totalOrders: 70, totalRevenue: 35000.00, status: 'Ativo' },
  { id: 'R005', name: 'Revendedor Epsilon', email: 'epsilon@example.com', totalOrders: 20, totalRevenue: 10000.00, status: 'Ativo' },
];

export default function ResellerReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { addToast } = useToast();

  const handleExportPdf = () => {
    addToast('Gerando PDF do relatório de revendedores...', 'info');
    // Simulate PDF generation and download
    setTimeout(() => {
      addToast('PDF do relatório de revendedores gerado com sucesso!', 'success');
    }, 1500);
  };

  const handleExportExcel = () => {
    addToast('Gerando Excel do relatório de revendedores...', 'info');
    // Simulate Excel generation and download
    setTimeout(() => {
      addToast('Excel do relatório de revendedores gerado com sucesso!', 'success');
    }, 1500);
  };

  const filteredResellers = mockResellerData.filter(reseller => {
    const matchesSearch =
      reseller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reseller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reseller.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || reseller.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const sortedResellers = [...filteredResellers].sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Relatório de Revendedores</h1>
        <p className="text-gray-600 dark:text-gray-400">Analise o desempenho dos seus revendedores.</p>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID do Revendedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total de Pedidos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Receita Gerada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedResellers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                      Nenhum revendedor encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  sortedResellers.map(reseller => (
                    <tr key={reseller.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{reseller.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{reseller.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{reseller.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{reseller.totalOrders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{reseller.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{reseller.status}</td>
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