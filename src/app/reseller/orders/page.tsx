'use client';

import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';

const mockOrders = [
  { id: '#1234', type: 'order', supplier: 'Fornecedor Teste', date: '2024-07-18', total: 'R$ 1.200,00', status: 'Entregue' },
  { id: '#1235', type: 'order', supplier: 'Fornecedor Teste', date: '2024-07-17', total: 'R$ 850,00', status: 'Enviado' },
  { id: '#1236', type: 'order', supplier: 'Fornecedor Calçados', date: '2024-07-16', total: 'R$ 2.340,00', status: 'Pendente' },
  { id: '#1237', type: 'order', supplier: 'Fornecedor Moda Feminina', date: '2024-07-15', total: 'R$ 500,00', status: 'Cancelado' },
];

const mockQuotes = [
  { id: '#Q001', type: 'quote', supplier: 'Fornecedor Teste', date: '2024-07-19', total: 'R$ 750,00', status: 'Pendente', validUntil: '2024-07-26' },
  { id: '#Q002', type: 'quote', supplier: 'Fornecedor Calçados', date: '2024-07-18', total: 'R$ 1.500,00', status: 'Aprovado', validUntil: '2024-07-25' },
  { id: '#Q003', type: 'quote', supplier: 'Fornecedor Moda Feminina', date: '2024-07-17', total: 'R$ 300,00', status: 'Expirado', validUntil: '2024-07-24' },
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewType, setViewType] = useState<'orders' | 'quotes'>('orders'); // 'orders' or 'quotes'
  const { addToast } = useToast();

  const dataToDisplay = viewType === 'orders' ? mockOrders : mockQuotes;

  const filteredData = dataToDisplay.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Entregue':
      case 'Aprovado':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{status}</span>;
      case 'Enviado':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{status}</span>;
      case 'Pendente':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{status}</span>;
      case 'Cancelado':
      case 'Expirado':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{status}</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{viewType === 'orders' ? 'Meus Pedidos' : 'Meus Orçamentos'}</h1>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Buscar por ID ou fornecedor...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Todos os status</option>
                {viewType === 'orders' ? (
                  <>
                    <option value="entregue">Entregue</option>
                    <option value="enviado">Enviado</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                  </>
                ) : (
                  <>
                    <option value="pendente">Pendente</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="expirado">Expirado</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('orders')}
              className={`px-4 py-2 rounded-lg font-semibold ${viewType === 'orders' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setViewType('quotes')}
              className={`px-4 py-2 rounded-lg font-semibold ${viewType === 'quotes' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              Orçamentos
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID do {viewType === 'orders' ? 'Pedido' : 'Orçamento'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                {viewType === 'quotes' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Válido Até</th>}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={viewType === 'quotes' ? 7 : 6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                    Nenhum {viewType === 'orders' ? 'pedido' : 'orçamento'} encontrado.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                    {viewType === 'quotes' && <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-400">{(item as any).validUntil}</td>}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link href={`/reseller/${viewType}/${item.id}`} className="text-primary hover:underline">
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}