'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | string;
  onChange: (value: number) => void;
  locale?: string;
  currency?: string;
}

/**
 * Brazilian Currency Input Component
 * 
 * Formats currency input according to Brazilian locale (pt-BR)
 * - Uses comma (,) as decimal separator
 * - Uses dot (.) as thousands separator
 * - Prefix: R$
 * 
 * @example
 * <CurrencyInput
 *   value={price}
 *   onChange={(value) => setPrice(value)}
 *   placeholder="0,00"
 * />
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, locale = 'pt-BR', currency = 'BRL', className, disabled, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);

    // Format number to Brazilian currency display
    const formatCurrency = (num: number): string => {
      if (isNaN(num)) return '';
      
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    };

    // Parse display value to number
    const parseValue = (str: string): number => {
      if (!str) return 0;
      
      // Remove all non-numeric characters except comma
      const cleaned = str.replace(/[^\d,]/g, '');
      
      // Replace comma with dot for parsing
      const normalized = cleaned.replace(',', '.');
      
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Update display value when prop value changes (only if not focused)
    React.useEffect(() => {
      if (!isFocused) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        setDisplayValue(formatCurrency(numValue || 0));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Allow only numbers, comma, and dot
      const cleaned = inputValue.replace(/[^\d,]/g, '');
      
      // Prevent multiple commas
      const parts = cleaned.split(',');
      let formatted = parts[0];
      if (parts.length > 1) {
        // Keep only first comma and limit decimals to 2
        formatted = parts[0] + ',' + parts[1].slice(0, 2);
      }
      
      setDisplayValue(formatted);
      
      // Parse and send numeric value to parent
      const numericValue = parseValue(formatted);
      onChange(numericValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      
      // Remove formatting on focus for easier editing
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (numValue > 0) {
        const formatted = formatCurrency(numValue);
        setDisplayValue(formatted);
      } else {
        setDisplayValue('');
      }
      
      // Select all text on focus
      setTimeout(() => e.target.select(), 0);
      
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Format display value on blur
      const numValue = parseValue(displayValue);
      setDisplayValue(formatCurrency(numValue));
      
      // Ensure parent has the correct value
      onChange(numValue);
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
      }
      
      // Ensure that it is a number or comma and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
          (e.keyCode < 96 || e.keyCode > 105) && 
          e.keyCode !== 188 && e.keyCode !== 190) {
        e.preventDefault();
      }
      
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-gray-400 text-sm pointer-events-none">
          R$
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`pl-10 ${className || ''}`}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
