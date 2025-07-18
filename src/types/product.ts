export interface Size {
  value: string;
  label: string;
}

export interface TargetAudience {
  id: string;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  // Tamanhos disponíveis para esta categoria (opcional)
  availableSizes?: Size[];
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrls?: string[];
  category?: Category | number; // Pode ser o objeto categoria ou apenas o ID
  categoryId?: number;
  sizes?: string[]; // Tamanhos selecionados para este produto
  targetAudiences?: TargetAudience[]; // Múltiplos públicos-alvo
  createdAt?: Date;
  updatedAt?: Date;
  supplierId?: string; // ID do fornecedor que cadastrou o produto
  supplierName?: string; // Nome do fornecedor que cadastrou o produto
  commission?: number; // Comissão do revendedor para este produto
  featured?: boolean; // Indica se o produto é destaque
}

// Constantes para uso em toda a aplicação
export const DEFAULT_TARGET_AUDIENCES: TargetAudience[] = [
  { id: 'masculino', name: 'Masculino' },
  { id: 'feminino', name: 'Feminino' },
  { id: 'infantil', name: 'Infantil' },
  { id: 'unissex', name: 'Unissex' },
  { id: 'plus-size', name: 'Plus Size' },
  { id: 'gestante', name: 'Gestante' },
  { id: 'pet', name: 'Pet' },
];

// Tamanhos padrão por tipo de produto
export const DEFAULT_SIZES = {
  roupas: [
    { value: 'PP', label: 'PP' },
    { value: 'P', label: 'P' },
    { value: 'M', label: 'M' },
    { value: 'G', label: 'G' },
    { value: 'GG', label: 'GG' },
    { value: 'XG', label: 'XG' },
  ],
  calcados: [
    { value: '34', label: '34' },
    { value: '35', label: '35' },
    { value: '36', label: '36' },
    { value: '37', label: '37' },
    { value: '38', label: '38' },
    { value: '39', label: '39' },
    { value: '40', label: '40' },
    { value: '41', label: '41' },
    { value: '42', label: '42' },
    { value: '43', label: '43' },
    { value: '44', label: '44' },
  ],
  acessorios: [
    { value: 'unico', label: 'Único' },
    { value: 'P', label: 'P' },
    { value: 'M', label: 'M' },
    { value: 'G', label: 'G' },
  ],
  infantil: [
    { value: 'RN', label: 'RN' },
    { value: '1-3M', label: '1-3M' },
    { value: '3-6M', label: '3-6M' },
    { value: '6-9M', label: '6-9M' },
    { value: '9-12M', label: '9-12M' },
    { value: '1-2A', label: '1-2 anos' },
    { value: '2-3A', label: '2-3 anos' },
    { value: '3-4A', label: '3-4 anos' },
    { value: '4-5A', label: '4-5 anos' },
    { value: '5-6A', label: '5-6 anos' },
    { value: '6-8A', label: '6-8 anos' },
    { value: '8-10A', label: '8-10 anos' },
    { value: '10-12A', label: '10-12 anos' },
    { value: '12-14A', label: '12-14 anos' },
  ],
};