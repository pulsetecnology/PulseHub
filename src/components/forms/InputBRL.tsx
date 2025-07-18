"use client";

import React, { useState, useEffect } from 'react';

interface InputBRLProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  name?: string;
}

const InputBRL: React.FC<InputBRLProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'R$ 0,00',
  required = false,
  id,
  name,
}) => {
  // Estado interno para controlar o valor formatado
  const [displayValue, setDisplayValue] = useState('');

  // Função para formatar o valor como moeda brasileira
  const formatAsCurrency = (value: string): string => {
    // Remover todos os caracteres não numéricos
    let numericValue = value.replace(/\D/g, '');
    
    // Se não houver valor, retornar vazio
    if (!numericValue) return '';
    
    // Converter para número e dividir por 100 para obter o valor em reais
    const floatValue = parseInt(numericValue) / 100;
    
    // Formatar como moeda brasileira
    return floatValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Função para extrair o valor numérico da string formatada
  const extractNumericValue = (formattedValue: string): string => {
    // Remover todos os caracteres não numéricos
    const numericValue = formattedValue.replace(/\D/g, '');
    
    // Converter para número e dividir por 100 para obter o valor em reais
    const floatValue = parseInt(numericValue || '0') / 100;
    
    // Retornar como string
    return floatValue.toString();
  };

  // Atualizar o valor formatado quando o valor externo mudar
  useEffect(() => {
    if (value) {
      // Converter o valor para centavos
      const cents = Math.round(parseFloat(value) * 100);
      setDisplayValue(formatAsCurrency((cents || 0).toString()));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Manipular mudanças no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remover formatação e manter apenas números
    const numericValue = inputValue.replace(/\D/g, '');
    
    // Formatar o valor para exibição
    const formattedValue = formatAsCurrency(numericValue);
    setDisplayValue(formattedValue);
    
    // Notificar o componente pai com o valor numérico
    onChange(extractNumericValue(formattedValue));
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={className}
        placeholder={placeholder}
        required={required}
        id={id}
        name={name}
        inputMode="numeric"
      />
    </div>
  );
};

export default InputBRL;