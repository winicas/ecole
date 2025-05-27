import React from 'react';

interface ProgressProps {
  value: number;
  className?: string; // Ajout de className dans les props
}

export const Progress = ({ value, className }: ProgressProps) => {
  return (
    <div 
      className={`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ${className}`} 
      // La classe personnalisée est ajoutée ici
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ 
          width: `${value}%`,
          background: "linear-gradient(to right, #3b82f6, #a855f7, #f43f5e)" 
          // Gradient appliqué directement ici
        }}
      ></div>
    </div>
  );
};