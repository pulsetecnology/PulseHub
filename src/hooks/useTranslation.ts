import { translations } from '@/locales/pt-BR';

// Função auxiliar para acessar propriedades aninhadas usando uma string de caminho
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) return path; // Retorna o caminho se não encontrar
    result = result[key];
  }
  
  return result === undefined || typeof result !== 'string' ? path : result;
}

export function useTranslation() {
  // Função para obter uma tradução
  const t = (key: string): string => {
    return getNestedValue(translations, key);
  };

  return { t };
}

export default useTranslation;