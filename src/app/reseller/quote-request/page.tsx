'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/layouts/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function QuoteRequestPage() {
  const router = useRouter();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { addToast } = useToast();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (cartItems.length === 0) {
    // Redirect to cart if no items
    router.push('/reseller/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real application, you would send this data to your API
      // For now, we'll simulate a successful request
      console.log('Solicitação de Orçamento:', {
        items: cartItems,
        totalPrice: totalPrice,
        notes: notes,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      addToast('Solicitação de orçamento enviada com sucesso!', 'success');
      clearCart(); // Clear cart after request
      router.push('/reseller/dashboard'); // Redirect to dashboard or a success page
    } catch (error) {
      console.error('Erro ao enviar solicitação de orçamento:', error);
      addToast('Ocorreu um erro ao enviar a solicitação de orçamento.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/reseller/cart" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Solicitar Orçamento</h1>
            <p className="text-gray-600 dark:text-gray-400">Revise seu carrinho e adicione observações para o fornecedor.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Itens do Orçamento</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {cartItems.map(item => (
              <li key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quantidade: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">Total:</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">R$ {totalPrice.toFixed(2)}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações (opcional)</label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary focus:border-primary"
                placeholder="Adicione quaisquer observações ou requisitos especiais para o fornecedor..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Enviando...' : 'Enviar Solicitação de Orçamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
