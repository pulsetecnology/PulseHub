import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onDelete?: () => void;
  isSupplier?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, isSupplier = true }) => {
  return (
    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 hover:shadow-lg transition flex flex-col justify-between">
      <Link href={isSupplier ? `/supplier/products/${product.id}` : `/reseller/products/${product.id}`}>
        <div className="cursor-pointer">
          <div className="relative w-full h-48 mb-2">
            <Image
              src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://via.placeholder.com/500'}
              alt={product.name}
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <h3 className="text-lg font-semibold mt-2 text-gray-800 dark:text-white">{product.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-left">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
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
        </div>
      )}
      {!isSupplier && (
        <div className="flex justify-end space-x-2 mt-4">
          <Link href={`/reseller/products/${product.id}`}>
            <button className="text-primary hover:text-primary-hover p-2 rounded-full hover:bg-primary/10 transition-colors">
              <FiEye size={20} />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductCard;