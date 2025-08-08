import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value?: number;
  className?: string;
}

const ProgressFallback: React.FC<ProgressProps> = ({ value = 0, className }) => {
  return (
    <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-gray-200", className)}>
      <div 
        className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export { ProgressFallback as Progress };