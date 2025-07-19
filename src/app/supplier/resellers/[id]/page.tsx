'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/layouts/MainLayout';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiShoppingCart, FiDollarSign, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

const mockReseller = {
  id: 'R001',
  name: 'Revendedor Alpha',
  email: 'alpha@example.com',
  phone: '(11) 98765-4321',
  address: 'Rua dos Revendedores, 123, Cidade, Estado',
  status: 'Ativo',
  totalOrders: 75,
  totalRevenue: 35000.00,
  lastOrderDate: '2024-07-10',
  orderHistory: [
    { id: 'ORD001', date: '2024-07-10', total: 1200.00, status: 'Entregue' },
    { id: 'ORD002', date: '2024-06-25', total: 850.00, status: 'Entregue' },
    { id: 'ORD003', date: '2024-06-01', total: 2340.00, status: 'Entregue' },
  ],
};

export default function ResellerProfilePage() {
  const params = useParams();
  const resellerId = params.id as string;
  const { addToast } = useToast();

  const [reseller, setReseller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching reseller data
    const fetchReseller = async () => {
      try {
        // In a real app, fetch from API: const res = await fetch(`/api/resellers/${resellerId}`);
        // const data = await res.json();
        const fetchedReseller = { ...mockReseller, id: resellerId };
        setReseller(fetchedReseller);
      } catch (error) {
        console.error('Error fetching reseller profile:', error);
        addToast('Erro ao carregar perfil do revendedor.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (resellerId) {
      fetchReseller();
    }
  }, [resellerId, addToast]);

  if (isLoading) {
    return (
      <MainLayout>
        <p>Carregando...</p>
      </MainLayout>
    );
  }

  if (!reseller) {
    return (
      <MainLayout>
        <p>Revendedor não encontrado.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/supplier/resellers" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Perfil do Revendedor</h1>
            <p className="text-gray-600 dark:text-gray-400">Detalhes e histórico de {reseller.name}.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Básicas */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center"><FiUser className="mr-2"/> Informações Pessoais</h2>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{reseller.name}</p>
            <p className="text-gray-600 dark:text-gray-400 flex items-center"><FiMail className="mr-2"/> {reseller.email}</p>
            <p className="text-gray-600 dark:text-gray-400 flex items-center"><FiPhone className="mr-2"/> {reseller.phone}</p>
            <p className="text-gray-600 dark:text-gray-400 flex items-center"><FiMapPin className="mr-2"/> {reseller.address}</p>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${reseller.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {reseller.status}
            </span>
            <Link href={`/supplier/resellers/${reseller.id}/edit`} className="block mt-4 text-primary hover:underline">
              Editar Perfil
            </Link>
          </div>

          {/* Estatísticas de Compra */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center"><FiDollarSign className="mr-2"/> Estatísticas de Compra</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reseller.totalOrders}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Receita Gerada</p>
                <p className="text-2xl font-bold text-primary">{reseller.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Último Pedido</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reseller.lastOrderDate}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6 flex items-center"><FiShoppingCart className="mr-2"/> Histórico de Pedidos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID do Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reseller.orderHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  ) : (
                    reseller.orderHistory.map((order: any) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{order.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{order.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link href={`/supplier/orders/${order.id}`} className="text-primary hover:underline">
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
        </div>
      </div>
    </MainLayout>
  );
}
