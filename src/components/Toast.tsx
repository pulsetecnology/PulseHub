"use client";

import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const icons = {
    success: <FiCheck className="text-green-500" size={20} />,
    error: <FiAlertCircle className="text-red-500" size={20} />,
    warning: <FiInfo className="text-yellow-500" size={20} />,
    info: <FiInfo className="text-blue-500" size={20} />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center max-w-md">
        <div className="mr-3">{icons[type]}</div>
        <div className="flex-1">{message}</div>
        <button
          onClick={handleClose}
          className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;