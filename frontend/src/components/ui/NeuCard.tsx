import React from 'react';

export const NeuCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-neu-base rounded-neu-card shadow-neu-extruded p-6 md:p-10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};