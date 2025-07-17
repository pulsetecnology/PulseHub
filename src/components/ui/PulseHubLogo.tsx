"use client";

import React from 'react';

interface PulseHubLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PulseHubLogo({ size = 'md', className = '' }: PulseHubLogoProps) {
  // Definindo tamanhos com base no parâmetro size
  const sizes = {
    sm: {
      container: 'h-8',
      logo: 'h-8',
      text: 'text-xl',
    },
    md: {
      container: 'h-10',
      logo: 'h-10',
      text: 'text-2xl',
    },
    lg: {
      container: 'h-12',
      logo: 'h-12',
      text: 'text-3xl',
    },
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Círculo com efeito pulsante */}
      <div className={`relative ${sizes[size].container} aspect-square bg-purple-500 rounded-full flex items-center justify-center`}>
        {/* Ondas de áudio/pulso */}
        <div className="flex items-center h-1/2 space-x-0.5">
          <div className="w-1 h-1/3 bg-white rounded-full"></div>
          <div className="w-1 h-2/3 bg-white rounded-full"></div>
          <div className="w-1 h-full bg-white rounded-full"></div>
          <div className="w-1 h-2/3 bg-white rounded-full"></div>
          <div className="w-1 h-1/3 bg-white rounded-full"></div>
        </div>

        {/* Círculos pulsantes animados */}
        <div className="absolute inset-0 rounded-full bg-purple-500 opacity-30 animate-ping-slow"></div>
        <div className="absolute inset-0 rounded-full bg-purple-500 opacity-20 animate-ping"></div>
      </div>

      {/* Texto do logo */}
      <div className={`ml-2 font-bold ${sizes[size].text}`}>
        <span className="text-purple-500">Pulse</span>
        <span className="text-teal-400">Hub</span>
      </div>
    </div>
  );
}