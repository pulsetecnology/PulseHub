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
  onBlur?: () => void;
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
  // Estado para armazenar o valor em centavos (como nas maquininhas de cartão)
  const [centavos, setCentavos] = useState<string>('');

  // Função para formatar o valor como moeda brasileira
  const formatAsCurrency = (centavosValue: string): string => {
    // Se não houver valor, retornar vazio
    if (!centavosValue || centavosValue === '0') return '';
    
    // Converter para número e dividir por 100 para obter o valor em reais
    const floatValue = parseInt(centavosValue) / 100;
    
    // Formatar como moeda brasileira
    return floatValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Atualizar o valor formatado quando o valor externo mudar
  useEffect(() => {
    if (value) {
      // Converter o valor para centavos
      const cents = Math.round(parseFloat(value) * 100).toString();
      setCentavos(cents);
      setDisplayValue(formatAsCurrency(cents));
    } else {
      setCentavos('');
      setDisplayValue('');
    }
  }, [value]);

  // Lida com o colar de valores
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numericValue = pastedText.replace(/\D/g, '');

    if (numericValue) {
      const newValue = numericValue.slice(0, 10); // Limita o tamanho
      setCentavos(newValue);
      setDisplayValue(formatAsCurrency(newValue));
      const floatValue = parseInt(newValue) / 100;
      onChange(floatValue.toString());
    }
  };

  // Manipular teclas pressionadas para implementar o comportamento de maquininha
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = e;
    const isNumericKey = /^\d$/.test(key);
    const isControlKey = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key);
    const isCopyPaste = (e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(key.toLowerCase());

    if (isControlKey || isCopyPaste) {
      if (key === 'Backspace') {
        e.preventDefault();
        if (centavos.length > 0) {
          const newValue = centavos.slice(0, -1);
          setCentavos(newValue);
          const floatValue = parseInt(newValue || '0') / 100;
          setDisplayValue(formatAsCurrency(newValue));
          onChange(newValue ? floatValue.toString() : '');
        }
      }
      return;
    }

    if (!isNumericKey) {
      e.preventDefault();
      return;
    }
    
    e.preventDefault();
    const newValue = centavos + key;

    if (newValue.length <= 10) {
      setCentavos(newValue);
      setDisplayValue(formatAsCurrency(newValue));
      const floatValue = parseInt(newValue) / 100;
      onChange(floatValue.toString());
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={() => {}} // onChange é necessário para alguns navegadores/dispositivos, mas a lógica está no onKeyDown
        className={className}
        placeholder={placeholder}
        required={required}
        id={id}
        name={name}
        inputMode="numeric"
        autoComplete="off"
      />
    </div>
  );
};

export default InputBRL;