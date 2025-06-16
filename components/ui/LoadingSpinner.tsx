import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className = '',
  size = 'md',
  text = 'Cargando...',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-solid border-blue-500 border-t-transparent`}
        role="status"
      >
        <span className="sr-only">{text}</span>
      </div>
      {text && <span className="mt-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
