import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
};
