'use client';

import React, { useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', value, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '' && value !== null;

    return (
      <div className="relative w-full">
        <div
          className={`relative border transition-colors duration-200 bg-white ${
            error
              ? 'border-destructive focus-within:border-destructive'
              : isFocused
              ? 'border-accent ring-1 ring-accent/20'
              : 'border-black/15 hover:border-black/30'
          }`}
        >
          <input
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder=" "
            className={`w-full px-4 pt-5 pb-2 text-sm text-primary bg-transparent outline-none transition-all ${className}`}
            {...props}
          />
          <label
            className={`absolute left-4 transition-all duration-200 pointer-events-none text-primary-muted ${
              isFocused || hasValue
                ? 'top-1.5 text-[10px] uppercase tracking-tracked font-medium text-accent'
                : 'top-3.5 text-xs tracking-wide'
            }`}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="mt-1 text-xs text-destructive tracking-wide animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
