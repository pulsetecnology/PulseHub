'use client';

import MainLayout from '@/layouts/MainLayout';
import { FiBarChart2, FiDollarSign, FiUsers, FiPackage } from 'react-icons/fi';

export default function AnalyticsDashboardPage() {
  // Mock data for demonstration
  const kpis = [
    { label: 'Vendas Totais', value: 'R$ 150.000', icon: FiDollarSign, color: 'text-green-500' },
    { label: 'Pedidos Processados', value: '500', icon: FiPackage, color: 'text-blue-500' },
    { label: 'Novos Revendedores', value: '25', icon: FiUsers, color: 'text-purple-500' },
    { label: 'Produtos em Destaque', value: '120', icon: FiBarChart2, color: 'text-yellow-500' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Analítico</h1>
        <p className="text-gray-600 dark:text-gray-400">Visão geral das suas métricas de negócio.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-opacity-20 ${kpi.color.replace('text-', 'bg-')}`}>
                <kpi.icon size={24} className={kpi.color} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder for charts and detailed reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Gráfico de Vendas Mensais</h2>
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500">
              Gráfico de vendas aqui (ex: Recharts, Chart.js)
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Top 5 Produtos Mais Vendidos</h2>
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500">
              Lista de produtos aqui
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}