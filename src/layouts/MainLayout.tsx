"use client";

import { useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHome, FiBox, FiUsers, FiLogOut, FiMenu, FiX, FiShoppingBag, FiFilter, FiTag } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ThemeToggle';
import PulseHubLogo from '@/components/ui/PulseHubLogo';

const supplierLinks = [
  { href: '/supplier/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/supplier/products', label: 'Meus Produtos', icon: FiBox },
  { href: '/supplier/categories', label: 'Categorias', icon: FiTag },
  { href: '/supplier/orders', label: 'Pedidos', icon: FiShoppingBag },
  { href: '/supplier/resellers', label: 'Revendedores', icon: FiUsers },
];

const resellerLinks = [
  { href: '/reseller/dashboard', label: 'Catálogo', icon: FiBox },
  { href: '/reseller/orders', label: 'Meus Pedidos', icon: FiShoppingBag },
  { href: '/reseller/quotes', label: 'Orçamentos', icon: FiFilter },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const links = user?.type === 'fornecedor' ? supplierLinks : resellerLinks;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl transition-all duration-300 border-r border-white/20 dark:border-gray-700/20">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex flex-col items-center">
          <PulseHubLogo size="md" />
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-2 text-center">
            {user?.type}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary dark:hover:text-primary transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md"
          >
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-primary/20 transition-colors mr-3">
              <link.icon size={18} />
            </div>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="group p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
              aria-label="Logout"
              title="Sair"
            >
              <FiLogOut size={18} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MainLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/3 to-green-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:w-64 relative z-10">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar & Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <aside className="w-64 relative z-10">
            <Sidebar />
          </aside>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="flex-1 bg-black/50 backdrop-blur-sm"
          ></div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-700/20">
          <div className="flex items-center">
            <PulseHubLogo size="sm" />
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}