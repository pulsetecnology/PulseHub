"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import PulseHubLogo from "@/components/ui/PulseHubLogo";
import Button from "@/components/ui/Button";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Obtém o tipo de usuário da URL (fornecedor ou revendedor)
  const userType = searchParams.get("type") as "fornecedor" | "revendedor" || "fornecedor";

  useEffect(() => {
    // Redireciona usuários já autenticados
    if (user) {
      if (user.type === "fornecedor") {
        router.push("/supplier/dashboard");
      } else {
        router.push("/reseller/dashboard");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Simulação de login - em uma implementação real, isso seria uma chamada de API
      setTimeout(() => {
        // Validação básica
        if (!email || !password) {
          setError("Por favor, preencha todos os campos");
          setIsLoading(false);
          return;
        }

        // Login simulado
        login(userType, { email });

        // Redireciona para o dashboard apropriado
        if (userType === "fornecedor") {
          router.push("/supplier/dashboard");
        } else {
          router.push("/reseller/dashboard");
        }
      }, 1000);
    } catch (err) {
      setError("Erro ao fazer login. Verifique suas credenciais.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/3 to-secondary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20">
          <div className="flex justify-center mb-6">
            <PulseHubLogo size="md" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-white">
            Bem-vindo de volta
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Entre como {userType === "fornecedor" ? "Fornecedor" : "Revendedor"}
          </p>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              rightIcon={<FiArrowRight />}
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{" "}
              <Link
                href={`/register?type=${userType}`}
                className="text-primary hover:text-primary-hover font-medium"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}