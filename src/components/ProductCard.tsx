import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FiEdit, FiTrash2, FiEye, FiPercent, FiTag, FiShoppingCart } from 'react-icons/fi';
import { DbProduct } from '@/types/product';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: DbProduct;
  onDelete?: () => void;
  isSupplier?: boolean;
  onToggleFeatured?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onToggleFeatured, isSupplier = true }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
    addToast(`${product.name} foi adicionado ao carrinho!`, "success");
  };

  // Calcular o valor da comissão se disponível
  const commissionValue = product.commission 
    ? (product.price * (product.commission / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : null;

  return (
    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 hover:shadow-lg transition flex flex-col justify-between">
      {product.featured && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-yellow-400 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            Destaque
          </span>
        </div>
      )}
      
      <Link href={isSupplier ? `/supplier/products/${product.id}` : `/reseller/products/${product.id}`}>
        <div className="cursor-pointer">
          <div className="relative w-full h-48 mb-2">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img
                src={product.imageUrls[0]}
                alt={product.name}
                className="object-cover rounded-md w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
                Sem imagem
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold mt-2 text-gray-800 dark:text-white">{product.name}</h3>
          
          {!isSupplier && product.supplierName && (
            <div className="flex items-center mt-1 mb-1">
              <FiTag className="text-gray-400 mr-1" size={14} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {product.supplierName}
              </p>
            </div>
          )}
          
          <p className="text-gray-500 dark:text-gray-400 text-left">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          
          {!isSupplier && product.commission && (
            <div className="flex items-center mt-1 text-green-600 dark:text-green-400">
              <FiPercent className="mr-1" size={14} />
              <p className="text-sm">
                Comissão: {product.commission}% ({commissionValue})
              </p>
            </div>
          )}
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.sizes.map((size) => (
                <span 
                  key={size} 
                  className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      
      {isSupplier && (
        <div className="flex justify-end space-x-2 mt-4">
          <Link href={`/supplier/products/${product.id}/edit`}>
            <button className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <FiEdit size={20} />
            </button>
          </Link>
          {onDelete && (
            <button 
              onClick={onDelete} 
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <FiTrash2 size={20} />
            </button>
          )}
          {onToggleFeatured && (
            <button 
              onClick={onToggleFeatured} 
              className={`p-2 rounded-full transition-colors ${
                product.featured 
                  ? "text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={product.featured ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          )}
        </div>
      )}
      
      {!isSupplier && (
        <div className="flex justify-between items-center mt-4">
            <Link href={`/reseller/products/${product.id}`}>
                <button className="text-primary hover:text-primary-hover p-2 rounded-full hover:bg-primary/10 transition-colors">
                <FiEye size={20} />
                </button>
            </Link>
            <button 
                onClick={handleAddToCart}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                <FiShoppingCart className="mr-2" />
                Adicionar
            </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;