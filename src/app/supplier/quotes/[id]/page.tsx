'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/layouts/MainLayout';
import { FiArrowLeft, FiUser, FiCalendar, FiDollarSign, FiPackage } from 'react-icons/fi';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

const mockQuote = {
  id: '#Q001',
  reseller: {
    name: 'João Silva',
    email: 'joao.silva@example.com',
    phone: '(11) 99887-7665',
    address: 'Av. Paulista, 1000, São Paulo, SP',
  },
  date: '2024-07-19',
  validUntil: '2024-07-26',
  total: 750.00,
  status: 'Pendente',
  items: [
    { id: 1, name: 'Vestido Floral', quantity: 5, price: 150.00, imageUrl: 'https://via.placeholder.com/150?text=Vestido' },
    { id: 2, name: 'Saia Plissada', quantity: 3, price: 90.00, imageUrl: 'https://via.placeholder.com/150?text=Saia' },
  ],
};

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const quoteId = params.id as string;
  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // In a real application, fetch quote details from your API
    // For now, we'll use a mock to simulate fetching
    const fetchedQuote = { ...mockQuote, id: quoteId };
    setQuote(fetchedQuote);
    setIsLoading(false);
  }, [quoteId]);

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error(`Falha ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} o orçamento.`);
      }

      setQuote((prev: any) => ({ ...prev, status: action === 'approve' ? 'Aprovado' : 'Rejeitado' }));
      addToast(`Orçamento ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`, 'success');
      router.push('/supplier/orders'); // Redirect to orders/quotes list
    } catch (error: any) {
      console.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} orçamento:`, error);
      addToast(error.message || `Ocorreu um erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} o orçamento.`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{status}</span>;
      case 'Pendente':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{status}</span>;
      case 'Rejeitado':
      case 'Expirado':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{status}</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) return <MainLayout><p>Carregando...</p></MainLayout>;
  if (!quote) return <MainLayout><p>Orçamento não encontrado.</p></MainLayout>;

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center mb-6">
          <Link href="/supplier/orders" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Detalhes do Orçamento {quote.id}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Itens do Orçamento */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><FiPackage className="mr-2"/> Itens do Orçamento</h2>
              <div className="space-y-4">
                {quote.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total do Orçamento */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center"><FiDollarSign className="mr-2"/> Total do Orçamento</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{quote.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Frete</span>
                        <span>R$ 0,00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>Total</span>
                        <span>{quote.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Informações do Revendedor e Ações */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><FiUser className="mr-2"/> Informações do Revendedor</h2>
              <div className="space-y-3">
                <p className="font-medium">{quote.reseller.name}</p>
                <p className="text-sm text-gray-500">{quote.reseller.email}</p>
                <p className="text-sm text-gray-500 flex items-center"><FiCalendar className="mr-2"/> Válido até: {quote.validUntil}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Status do Orçamento</h2>
              <div className="flex items-center justify-between mb-4">
                <p>Status atual:</p>
                {getStatusBadge(quote.status)}
              </div>
              {quote.status === 'Pendente' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processando...' : 'Aprovar'}
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processando...' : 'Rejeitar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
