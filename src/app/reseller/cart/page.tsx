
"use client";

import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/layouts/MainLayout";
import { FiTrash2, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { addToast } = useToast();

  const handleRequestQuote = () => {
    // Lógica para solicitar orçamento
    addToast("Orçamento solicitado com sucesso!", "success");
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
            <Link href="/reseller/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meu Carrinho</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Seu carrinho está vazio.</p>
            <Link href="/reseller/dashboard" className="text-primary hover:underline mt-4 inline-block">
              Continuar comprando
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Itens do Carrinho</h2>
                <button onClick={clearCart} className="text-red-500 hover:underline">Limpar Carrinho</button>
              </div>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <img src={item.imageUrls?.[0]} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-md mx-4"
                      />
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>A calcular</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
              <Link href="/reseller/checkout" className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors text-center block">
                Finalizar Pedido
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
