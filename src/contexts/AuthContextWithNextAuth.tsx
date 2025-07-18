"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Definindo os tipos
export type UserType = 'fornecedor' | 'revendedor';

interface User {
  id?: string;
  name?: string;
  email?: string;
  type: UserType;
}

interface AuthContextType {
  user: User | null;
  login: (userType: UserType, userData?: Partial<User>) => void;
  logout: () => void;
  isLoading: boolean;
}

// Criando o contexto
const AuthContextWithNextAuth = createContext<AuthContextType | undefined>(undefined);

// Criando o provedor
export const AuthProviderWithNextAuth = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const isLoading = status === "loading";

  // Sincroniza o estado do usuário com a sessão do NextAuth
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        type: session.user.type,
      });
    } else if (status === "unauthenticated") {
      // Verifica se há um usuário no localStorage quando não há sessão
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('authUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null);
        }
      }
    }
  }, [session, status]);

  const login = async (userType: UserType, userData?: Partial<User>) => {
    // Para compatibilidade com o código existente, ainda armazenamos no localStorage
    const newUser = { 
      type: userType,
      ...userData
    };
    
    // Armazena no localStorage para compatibilidade com o código existente
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify(newUser));
    }
    
    setUser(newUser);
    
    // Se tivermos email e senha, tentamos fazer login com NextAuth
    if (userData?.email) {
      try {
        // Aqui estamos assumindo que o login via NextAuth será implementado posteriormente
        // Este é apenas um placeholder para a migração
        await signIn("credentials", {
          redirect: false,
          email: userData.email,
          // Nota: em uma implementação real, você precisaria da senha
          password: "placeholder-password",
        });
      } catch (error) {
        console.error("Erro ao fazer login com NextAuth:", error);
      }
    }
  };

  const logout = async () => {
    // Remove o usuário do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser');
    }
    
    setUser(null);
    
    // Faz logout do NextAuth
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Erro ao fazer logout com NextAuth:", error);
    }
  };

  return (
    <AuthContextWithNextAuth.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContextWithNextAuth.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuthWithNextAuth = () => {
  const context = useContext(AuthContextWithNextAuth);
  if (context === undefined) {
    throw new Error('useAuthWithNextAuth must be used within an AuthProviderWithNextAuth');
  }
  return context;
};