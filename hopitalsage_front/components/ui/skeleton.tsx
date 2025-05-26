import React from 'react';
import clsx from 'clsx';

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-300 dark:bg-zinc-700 rounded-md',
        className
      )}
    />
  );
}
