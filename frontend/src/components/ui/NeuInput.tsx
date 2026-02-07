import React from 'react';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const NeuInput: React.FC<NeuInputProps> = ({ label, className = '', disabled, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-neu-muted">
          {label}
        </label>
      )}
      <input
        disabled={disabled}
        className={`
          w-full bg-neu-base text-neu-text rounded-neu px-5 py-3
          outline-none transition-all duration-300
          placeholder:text-neu-muted/40
          ${disabled 
            ? 'shadow-none border-2 border-transparent opacity-60 cursor-not-allowed' // Flat for disabled
            : 'shadow-neu-inset-deep focus:shadow-neu-inset focus:ring-2 focus:ring-neu-accent/50' // Deep for active
          }
          ${className}
        `}
        {...props}
      />
    </div>
  );
};