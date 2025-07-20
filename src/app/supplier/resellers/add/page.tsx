"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNextAuth } from "@/hooks/useNextAuth";
import MainLayout from "@/layouts/MainLayout";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { registerUser } from "@/lib/auth-utils";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

export default function AddReseller() {
  const router = useRouter();
  const { user } = useNextAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    sendInvite: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      addToast("As senhas não coincidem.", "error");
      return;
    }
    
    if (formData.password.length < 6) {
      addToast("A senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register the user as a revendedor
      const newUser = registerUser(
        formData.name,
        formData.email,
        formData.password,
        "revendedor"
      );
      
      // Criar relacionamento entre fornecedor e revendedor
      if (user?.id && newUser?.id) {
        // Importar a função para criar relacionamento
        const { createSupplierResellerRelation } = await import("@/lib/auth-utils");
        
        // Criar relacionamento com status aprovado diretamente
        createSupplierResellerRelation(
          user.id,
          newUser.id,
          "approved",
          10 // Comissão padrão de 10%
        );
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      addToast(`Revendedor ${formData.name} adicionado com sucesso! O revendedor já pode fazer login com as credenciais fornecidas.`, "success");
      
      // Redirecionar para a página de listagem de revendedores
      router.push('/supplier/resellers');
      
      // Simulate sending email invitation
      if (formData.sendInvite) {
        console.log(`Enviando convite para ${formData.email}`);
      }
    } catch (err: any) {
      console.error("Error adding reseller:", err);
      addToast(err.message || "Ocorreu um erro ao adicionar o revendedor. Por favor, tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.type !== "fornecedor") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/supplier/resellers" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Adicionar Revendedor</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Cadastre um novo revendedor para acessar seu catálogo de produtos
            </p>
          </div>
        </div>

        

        

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome do revendedor"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirme a senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="sendInvite"
                  name="sendInvite"
                  type="checkbox"
                  checked={formData.sendInvite}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="sendInvite" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enviar convite por email
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/supplier/resellers"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
              >
                {isLoading ? "Adicionando..." : "Adicionar Revendedor"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FiMail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">Sobre o convite por email</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  Ao marcar a opção "Enviar convite por email", o sistema enviará um email para o revendedor com instruções para acessar a plataforma.
                </p>
                <p className="mt-2">
                  O email conterá um link para a página de login, onde o revendedor poderá usar o email e a senha definidos por você para acessar a plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}