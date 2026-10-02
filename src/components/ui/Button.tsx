'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  shimmer?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  shimmer = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden';

  const sizeStyles = {
    sm: 'text-xs uppercase tracking-tracked px-4 py-2 h-9',
    md: 'text-xs uppercase tracking-tracked px-6 py-3.5 h-12',
    lg: 'text-sm uppercase tracking-tracked px-8 py-4 h-14',
  };

  const variantStyles = {
    primary:
      'bg-[#1A1A1A] text-white hover:bg-black border border-[#1A1A1A] shadow-sm',
    secondary:
      'bg-[#F5F5F0] text-[#1A1A1A] hover:bg-[#EAEAE5] border border-black/5',
    outline:
      'bg-transparent text-[#1A1A1A] border border-black/20 hover:border-black hover:bg-black/5',
    ghost:
      'bg-transparent text-[#1A1A1A] hover:bg-black/5 border border-transparent',
    danger:
      'bg-[#DC2626] text-white hover:bg-red-700 border border-[#DC2626]',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        shimmer ? 'btn-shimmer relative' : ''
      } ${className}`}
      {...props}
    >
      {shimmer && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:animate-[shimmer_2s_infinite]" />
      )}
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>Processing</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
