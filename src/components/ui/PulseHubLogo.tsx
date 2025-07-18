"use client";

import React from 'react';

interface PulseHubLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PulseHubLogo({ size = 'md', className = '' }: PulseHubLogoProps) {
  // Definindo tamanhos com base no parâmetro size
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`font-bold ${sizes[size]}`}>
        <span className="text-blue-600">Pulse</span>
        <span className="text-green-600">Hub</span>
      </div>
    </div>
  );
}