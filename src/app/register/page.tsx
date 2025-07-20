"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PulseHubLogo from "@/components/ui/PulseHubLogo";
import { registerUser } from "@/lib/auth-utils";
import { signIn } from "next-auth/react";
import { useToast } from "@/contexts/ToastContext";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "revendedor", // Default to revendedor
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      // Register the user via API
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          type: formData.userType
        })
      });
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || 'Falha ao criar usuário');
      }
      
      const newUser = await userResponse.json();
      console.log('Usuário criado com sucesso:', newUser.id);
      
      // Auto-login after registration
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      
      if (result?.error) {
        addToast("Usuário criado com sucesso! Por favor, faça login.", "success");
        router.push("/login?registered=true");
      } else {
        addToast("Cadastro e login realizados com sucesso!", "success");
        // Aguardar um momento para a sessão ser atualizada
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect based on user type
        router.push(formData.userType === "fornecedor" ? "/supplier/dashboard" : "/reseller/dashboard");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      addToast(err.message || "Ocorreu um erro durante o cadastro. Por favor, tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
          <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-8">
              <PulseHubLogo size="md" />
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
              Crie sua conta
            </h1>
            
            
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Seu nome completo"
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
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de usuário
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="revendedor">Revendedor</option>
                  <option value="fornecedor">Fornecedor</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.userType === "fornecedor" 
                    ? "Como fornecedor, você poderá cadastrar produtos e gerenciar revendedores." 
                    : "Como revendedor, você terá acesso ao catálogo de produtos dos fornecedores."}
                </p>
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
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-gradient-to-r from-primary to-primary-hover text-white font-medium rounded-md hover:from-primary-hover hover:to-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary hover:text-primary-hover dark:text-blue-400 font-medium">
                  Faça login
                </Link>
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Ao se cadastrar, você concorda com nossos{" "}
                <a href="#" className="text-primary hover:text-primary-hover dark:text-blue-400">
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a href="#" className="text-primary hover:text-primary-hover dark:text-blue-400">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}