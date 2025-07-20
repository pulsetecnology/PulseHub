export interface SizeOption {
  label: string;
  value: string;
}

export interface SizeType {
  id: string;
  name: string;
  description: string;
  sizes: SizeOption[];
}

export const SIZE_TYPES: SizeType[] = [
  {
    id: 'clothing',
    name: 'Roupas (PP, P, M, G, GG)',
    description: 'Tamanhos padrão para roupas em geral',
    sizes: [
      { label: 'PP', value: 'PP' },
      { label: 'P', value: 'P' },
      { label: 'M', value: 'M' },
      { label: 'G', value: 'G' },
      { label: 'GG', value: 'GG' },
      { label: 'XGG', value: 'XGG' },
    ]
  },
  {
    id: 'shoes',
    name: 'Calçados (34-44)',
    description: 'Numeração padrão brasileira para calçados',
    sizes: [
      { label: '33', value: '33' },
      { label: '34', value: '34' },
      { label: '35', value: '35' },
      { label: '36', value: '36' },
      { label: '37', value: '37' },
      { label: '38', value: '38' },
      { label: '39', value: '39' },
      { label: '40', value: '40' },
      { label: '41', value: '41' },
      { label: '42', value: '42' },
      { label: '43', value: '43' },
      { label: '44', value: '44' },
      { label: '45', value: '45' },
    ]
  },
  {
    id: 'children',
    name: 'Infantil (RN-24M)',
    description: 'Tamanhos para roupas infantis por idade',
    sizes: [
      { label: 'RN', value: 'RN' },
      { label: '1M', value: '1M' },
      { label: '3M', value: '3M' },
      { label: '6M', value: '6M' },
      { label: '9M', value: '9M' },
      { label: '12M', value: '12M' },
      { label: '18M', value: '18M' },
      { label: '24M', value: '24M' },
      { label: '2A', value: '2A' },
      { label: '3A', value: '3A' },
      { label: '4A', value: '4A' },
      { label: '6A', value: '6A' },
      { label: '8A', value: '8A' },
      { label: '10A', value: '10A' },
    ]
  },
  {
    id: 'pants',
    name: 'Calças (36-54)',
    description: 'Numeração para calças e jeans',
    sizes: [
      { label: '36', value: '36' },
      { label: '38', value: '38' },
      { label: '40', value: '40' },
      { label: '42', value: '42' },
      { label: '44', value: '44' },
      { label: '46', value: '46' },
      { label: '48', value: '48' },
      { label: '50', value: '50' },
      { label: '52', value: '52' },
      { label: '54', value: '54' },
    ]
  },
  {
    id: 'accessories',
    name: 'Acessórios (Único)',
    description: 'Para produtos que não têm variação de tamanho',
    sizes: [
      { label: 'Único', value: 'unico' },
    ]
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Defina seus próprios tamanhos',
    sizes: [] // Será preenchido pelo usuário
  }
];

export const getSizeTypeById = (id: string): SizeType | undefined => {
  return SIZE_TYPES.find(type => type.id === id);
};

export const getSizesByType = (sizeType: string, customSizes?: string): SizeOption[] => {
  if (sizeType === 'custom' && customSizes) {
    try {
      return JSON.parse(customSizes);
    } catch {
      return [];
    }
  }
  
  const type = getSizeTypeById(sizeType);
  return type?.sizes || [];
};