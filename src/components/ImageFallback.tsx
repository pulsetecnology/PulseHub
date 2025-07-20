import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageFallbackProps {
  src: string;
  alt: string;
  fallbackText?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImageFallback({
  src,
  alt,
  fallbackText,
  width = 500,
  height = 500,
  className = '',
}: ImageFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Extrair texto do placeholder se for uma URL de placeholder
  const extractPlaceholderText = (url: string) => {
    try {
      if (url.includes('placeholder.com') && url.includes('text=')) {
        const textParam = url.split('text=')[1];
        if (textParam) {
          return decodeURIComponent(textParam.split('&')[0]);
        }
      }
      return fallbackText || alt;
    } catch (e) {
      return fallbackText || alt;
    }
  };

  const displayText = extractPlaceholderText(src);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: width, height: height }}
    >
      {!error ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-center p-4"
        >
          <span>{displayText}</span>
        </div>
      )}
      
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-pulse w-full h-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      )}
    </div>
  );
}