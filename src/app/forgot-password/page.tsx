"use client";

import { useState } from "react";
import Link from "next/link";
import PulseHubLogo from "@/components/ui/PulseHubLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // In a real application, you would make an API call to send a password reset email
      // For now, we'll simulate a successful submission
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set submitted state to show success message
      setIsSubmitted(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.");
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
              Recuperar senha
            </h1>
            
            {isSubmitted ? (
              <div className="text-center">
                <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-md">
                  <p className="font-medium">Email de recuperação enviado!</p>
                  <p className="text-sm mt-1">
                    Enviamos instruções para redefinir sua senha para {email}. 
                    Por favor, verifique sua caixa de entrada.
                  </p>
                </div>
                
                <Link 
                  href="/login" 
                  className="mt-4 inline-block text-primary hover:text-primary-hover dark:text-blue-400"
                >
                  Voltar para o login
                </Link>
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 text-center">
                  Digite seu email e enviaremos instruções para redefinir sua senha.
                </p>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2 px-4 bg-gradient-to-r from-primary to-primary-hover text-white font-medium rounded-md hover:from-primary-hover hover:to-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                    >
                      {isLoading ? "Enviando..." : "Enviar instruções"}
                    </button>
                  </div>
                </form>
                
                <div className="mt-6 text-center">
                  <Link href="/login" className="text-primary hover:text-primary-hover dark:text-blue-400 text-sm">
                    Voltar para o login
                  </Link>
                </div>
              </>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Precisa de ajuda?{" "}
                <a href="#" className="text-primary hover:text-primary-hover dark:text-blue-400">
                  Entre em contato com o suporte
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}