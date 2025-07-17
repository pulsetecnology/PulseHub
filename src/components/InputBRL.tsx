"use client";

import React, { useState, useEffect } from 'react';

interface InputBRLProps {
  value: number | string;
  onChange: (value: number) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
}

const InputBRL: React.FC<InputBRLProps> = ({
  value,
  onChange,
  id,
  name,
  placeholder = 'R$ 0,00',
  className = '',
  required = false,
  disabled = false,
  error,
  label,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Formata o valor numérico para exibição como moeda
  const formatToCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Converte string formatada para número
  const parseFromCurrency = (value: string): number => {
    // Remove todos os caracteres não numéricos, exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    
    // Substitui vírgula por ponto para conversão correta
    const normalizedValue = cleanValue.replace(',', '.');
    
    // Converte para número
    const numericValue = parseFloat(normalizedValue);
    
    // Retorna 0 se não for um número válido
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Inicializa o valor de exibição
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const numericValue = typeof value === 'string' ? parseFromCurrency(value) : value;
      setDisplayValue(formatToCurrency(numericValue));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove formatação para obter apenas os números
    let rawValue = inputValue.replace(/[^\d,.-]/g, '');
    
    // Limita a dois dígitos após a vírgula
    if (rawValue.includes(',')) {
      const parts = rawValue.split(',');
      if (parts[1] && parts[1].length > 2) {
        rawValue = `${parts[0]},${parts[1].substring(0, 2)}`;
      }
    }
    
    // Converte para número
    const numericValue = parseFromCurrency(rawValue);
    
    // Atualiza o valor formatado para exibição
    setDisplayValue(rawValue ? formatToCurrency(numericValue) : '');
    
    // Chama o callback com o valor numérico
    onChange(numericValue);
  };

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 dark:text-gray-400">R$</span>
        </div>
        <input
          type="text"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          } ${className}`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default InputBRL;