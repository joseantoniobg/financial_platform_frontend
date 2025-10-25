'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: string | Date;
  onChange: (value: string) => void;
}

/**
 * Brazilian Date Input Component
 * 
 * Formats date input according to Brazilian format (dd/MM/yyyy)
 * - Uses dd/MM/yyyy format for display
 * - Returns ISO format (yyyy-MM-dd) for storage
 * - Validates date format
 * 
 * @example
 * <DateInput
 *   value={date}
 *   onChange={(value) => setDate(value)}
 *   placeholder="dd/mm/aaaa"
 * />
 */
export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, disabled, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);

    // Convert ISO date to Brazilian format (dd/MM/yyyy)
    const toBrazilianFormat = (isoDate: string | Date): string => {
      if (!isoDate) return '';
      
      try {
        const date = typeof isoDate === 'string' ? new Date(isoDate + 'T00:00:00') : isoDate;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return '';
      }
    };

    // Convert Brazilian format to ISO (yyyy-MM-dd)
    const toISOFormat = (brDate: string): string => {
      if (!brDate) return '';
      
      // Remove any non-numeric characters except /
      const cleaned = brDate.replace(/[^\d/]/g, '');
      const parts = cleaned.split('/');
      
      if (parts.length !== 3) return '';
      
      const [day, month, year] = parts;
      
      // Validate
      if (day.length !== 2 || month.length !== 2 || year.length !== 4) return '';
      
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (dayNum < 1 || dayNum > 31) return '';
      if (monthNum < 1 || monthNum > 12) return '';
      if (yearNum < 1900 || yearNum > 2100) return '';
      
      return `${year}-${month}-${day}`;
    };

    // Format as user types (add slashes automatically)
    const formatInput = (input: string): string => {
      // Remove all non-numeric characters
      const numbers = input.replace(/\D/g, '');
      
      let formatted = numbers;
      
      // Add first slash after day (2 digits)
      if (numbers.length >= 3) {
        formatted = numbers.slice(0, 2) + '/' + numbers.slice(2);
      }
      
      // Add second slash after month (2 digits)
      if (numbers.length >= 5) {
        formatted = numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
      }
      
      return formatted;
    };

    // Update display value when prop value changes (only if not focused)
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(toBrazilianFormat(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Format the input
      const formatted = formatInput(inputValue);
      setDisplayValue(formatted);
      
      // If we have a complete date (dd/MM/yyyy), convert to ISO and call onChange
      if (formatted.length === 10) {
        const isoDate = toISOFormat(formatted);
        if (isoDate) {
          onChange(isoDate);
        }
      } else if (inputValue === '') {
        // Handle clearing the input
        onChange('');
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Validate and reformat on blur
      if (displayValue) {
        const isoDate = toISOFormat(displayValue);
        if (isoDate) {
          onChange(isoDate);
          setDisplayValue(toBrazilianFormat(isoDate));
        } else {
          // Invalid date, clear it
          setDisplayValue('');
          onChange('');
        }
      }
      
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
      
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
          (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
      
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        maxLength={10}
        placeholder="dd/mm/aaaa"
        disabled={disabled}
        className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
        {...props}
      />
    );
  }
);

DateInput.displayName = 'DateInput';
