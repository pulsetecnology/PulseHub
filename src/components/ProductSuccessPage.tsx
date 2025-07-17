"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProductSuccessPageProps {
  productId: number | null;
}

export default function ProductSuccessPage({ productId }: ProductSuccessPageProps) {
  const router = useRouter();

  const handleViewProduct = () => {
    if (productId) {
      router.push(`/supplier/products/${productId}`);
    }
  };

  const handleBackToList = () => {
    router.push('/supplier/products');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Produto salvo com sucesso!
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            As alterações foram salvas com sucesso.
          </p>

          <div className="space-y-3">
            {productId && (
              <button
                onClick={handleViewProduct}
                className="inline-block w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Ver Produto
              </button>
            )}

            <button
              onClick={handleBackToList}
              className="inline-block w-full px-4 py-3 bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/80 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-600/50 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl font-semibold transition-all duration-200"
            >
              Voltar para Lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}