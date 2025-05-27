import React from 'react';
import clsx from 'clsx';

interface ProgressProps {
  value: number; // Pourcentage (0 à 100)
  label?: string; // Label textuel optionnel
  height?: string; // Hauteur personnalisable (ex: "h-2.5", "h-4")
  className?: string; // Classe appliquée au conteneur externe
  trackClassName?: string; // Classe appliquée à l'arrière-plan
  barClassName?: string; // Classe appliquée à la barre de progression
}

export const Progress = ({
  value,
  label,
  height = 'h-2.5',
  className = '',
  trackClassName = '',
  barClassName = '',
}: ProgressProps) => {
  return (
    <div className={clsx('w-full space-y-1', className)}>
      {label && <span className="text-sm font-medium">{label}</span>}

      <div
        className={clsx(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          height,
          trackClassName
        )}
      >
        <div
          className={clsx(
            'bg-blue-600 rounded-full transition-all duration-500 ease-in-out',
            height,
            barClassName
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
