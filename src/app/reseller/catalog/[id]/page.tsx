'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/layouts/MainLayout';
import { FiArrowLeft, FiShoppingCart, FiDollarSign, FiTag } from 'react-icons/fi';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import { useCart } from '@/contexts/CartContext';

const mockProduct = {
  id: 1,
  name: 'Vestido Floral de Verão',
  description: 'Vestido leve e elegante, perfeito para o verão. Feito com tecido respirável e estampa floral vibrante.',
  price: 189.90,
  imageUrls: [
    'https://via.placeholder.com/600x400?text=Vestido+Floral+1',
    'https://via.placeholder.com/600x400?text=Vestido+Floral+2',
    'https://via.placeholder.com/600x400?text=Vestido+Floral+3',
  ],
  category: 'Roupas',
  sizes: ['P', 'M', 'G', 'GG'],
  targetAudiences: ['Feminino'],
  featured: true,
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const { addToast } = useToast();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Simulate fetching product data
    const fetchProduct = async () => {
      try {
        // In a real app, fetch from API: const res = await fetch(`/api/products/${productId}`);
        // const data = await res = await res.json();
        const fetchedProduct = { ...mockProduct, id: productId };
        setProduct(fetchedProduct);
        setSelectedImage(fetchedProduct.imageUrls[0]);
      } catch (error) {
        console.error('Error fetching product details:', error);
        addToast('Erro ao carregar detalhes do produto.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, addToast]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      addToast(`${quantity}x ${product.name} adicionado(s) ao carrinho!`, 'success');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <p>Carregando...</p>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <p>Produto não encontrado.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/reseller/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{product.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Detalhes do produto.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {/* Imagens do Produto */}
          <div>
            <img src={selectedImage} alt={product.name} className="w-full h-96 object-cover rounded-lg shadow-lg" />
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {product.imageUrls.map((url: string, index: number) => (
                <img
                  key={index}
                  src={url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className={`w-24 h-24 object-cover rounded-md cursor-pointer ${selectedImage === url ? 'border-2 border-primary' : ''}`}
                  onClick={() => setSelectedImage(url)}
                />
              ))}
            </div>
          </div>

          {/* Detalhes do Produto */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-primary">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{product.description}</p>
            </div>

            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300 flex items-center"><FiTag className="mr-2"/> <span className="font-semibold">Categoria:</span> {product.category}</p>
              <p className="text-gray-700 dark:text-gray-300 flex items-center"><FiTag className="mr-2"/> <span className="font-semibold">Tamanhos:</span> {product.sizes.join(', ')}</p>
              <p className="text-gray-700 dark:text-gray-300 flex items-center"><FiTag className="mr-2"/> <span className="font-semibold">Público-alvo:</span> {product.targetAudiences.join(', ')}</p>
            </div>

            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="text-gray-700 dark:text-gray-300">Quantidade:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center"
              >
                <FiShoppingCart className="mr-2" /> Adicionar ao Carrinho
              </button>
              <Link
                href="/reseller/quote-request"
                className="flex-1 px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary-hover hover:text-white transition-colors flex items-center justify-center"
              >
                <FiDollarSign className="mr-2" /> Solicitar Orçamento
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}