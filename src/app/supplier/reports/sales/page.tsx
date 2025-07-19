'use client';

import MainLayout from '@/layouts/MainLayout';
import { useState } from 'react';
import { FiSearch, FiCalendar } from 'react-icons/fi';

const mockSalesData = [
  { id: 'S001', date: '2024-07-01', product: 'Camiseta Básica', quantity: 10, price: 49.90, total: 499.00 },
  { id: 'S002', date: '2024-07-01', product: 'Calça Jeans', quantity: 5, price: 129.90, total: 649.50 },
  { id: 'S003', date: '2024-07-02', product: 'Vestido Floral', quantity: 3, price: 150.00, total: 450.00 },
  { id: 'S004', date: '2024-07-03', product: 'Camiseta Básica', quantity: 7, price: 49.90, total: 349.30 },
  { id: 'S005', date: '2024-07-04', product: 'Saia Plissada', quantity: 2, price: 90.00, total: 180.00 },
];

import { useToast } from '@/contexts/ToastContext';

export default function SalesReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { addToast } = useToast();

  const handleExportPdf = () => {
    addToast('Gerando PDF do relatório de vendas...', 'info');
    // Simulate PDF generation and download
    setTimeout(() => {
      addToast('PDF do relatório de vendas gerado com sucesso!', 'success');
    }, 1500);
  };

  const handleExportExcel = () => {
    addToast('Gerando Excel do relatório de vendas...', 'info');
    // Simulate Excel generation and download
    setTimeout(() => {
      addToast('Excel do relatório de vendas gerado com sucesso!', 'success');
    }, 1500);
  };

  const filteredSales = mockSalesData.filter(sale => {
    const matchesSearch = 
      sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = 
      (!startDate || sale.date >= startDate) &&
      (!endDate || sale.date <= endDate);

    return matchesSearch && matchesDate;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Relatório de Vendas</h1>
        <p className="text-gray-600 dark:text-gray-400">Visualize o desempenho de vendas dos seus produtos.</p>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por produto ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="relative flex-1 min-w-[150px]">
              <FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="relative flex-1 min-w-[150px]">
              <FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID da Venda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Preço Unitário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                      Nenhuma venda encontrada para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map(sale => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{sale.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{sale.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{sale.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{sale.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{sale.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
            <p className="text-lg font-semibold text-gray-800 dark:text-white">Total de Vendas:</p>
            <p className="text-2xl font-bold text-primary">{totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
