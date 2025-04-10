import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        
        // Variant styles
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        },
        
        // Size styles
        {
          'h-8 px-3 text-xs': size === 'sm',
          'h-9 px-4 py-2': size === 'md',
          'h-10 px-8': size === 'lg',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
