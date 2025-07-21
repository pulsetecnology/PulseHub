export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrls: string[];
  category?: string;
  sizes?: string[];
  targetAudiences?: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  supplierId?: string;
  supplierName?: string;
  commission?: number;
}

export const DEFAULT_SIZES = {
  roupas: [
    { label: "PP", value: "PP" },
    { label: "P", value: "P" },
    { label: "M", value: "M" },
    { label: "G", value: "G" },
    { label: "GG", value: "GG" },
  ],
  calcados: [
    { label: "34", value: "34" },
    { label: "35", value: "35" },
    { label: "36", value: "36" },
    { label: "37", value: "37" },
    { label: "38", value: "38" },
    { label: "39", value: "39" },
    { label: "40", value: "40" },
    { label: "41", value: "41" },
    { label: "42", value: "42" },
  ],
  acessorios: [{ label: "Único", value: "unico" }],
  infantil: [
    { label: "RN", value: "RN" },
    { label: "3M", value: "3M" },
    { label: "6M", value: "6M" },
    { label: "9M", value: "9M" },
    { label: "12M", value: "12M" },
    { label: "18M", value: "18M" },
    { label: "24M", value: "24M" },
  ],
};

export const DEFAULT_TARGET_AUDIENCES = [
  { id: "masculino", name: "Masculino" },
  { id: "feminino", name: "Feminino" },
  { id: "unissex", name: "Unissex" },
  { id: "infantil", name: "Infantil" },
];