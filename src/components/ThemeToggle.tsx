"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { FiMoon, FiSun } from 'react-icons/fi';
import useTranslation from '@/hooks/useTranslation';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label={theme === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark')}
      title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
    >
      {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}