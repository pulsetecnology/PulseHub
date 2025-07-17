"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

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
}

// Criando o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Criando o provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializa o estado do usuário a partir do localStorage, se disponível
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('authUser');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const login = (userType: UserType, userData?: Partial<User>) => {
    const newUser = { 
      type: userType,
      ...userData
    };
    setUser(newUser);
    // Salva o usuário no localStorage para persistir a autenticação
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    // Remove o usuário do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};