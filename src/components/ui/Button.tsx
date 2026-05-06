import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-6 py-2 rounded-lg font-medium transition-all duration-200 flex justify-center items-center';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    outline: 'border border-gray-600 hover:border-gray-400 text-gray-300',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${isLoading || props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
