import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'error' | 'success';
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'error' }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = "fixed bottom-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg flex items-center animate-fade-in-up";
  const typeClasses = {
    error: "bg-red-600",
    success: "bg-green-600",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span className="mr-3">{message}</span>
      <button onClick={onClose} className="text-xl font-bold">&times;</button>
    </div>
  );
};