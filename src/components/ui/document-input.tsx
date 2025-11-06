'use client';

import { Input } from './input';
import { useState, useEffect } from 'react';

interface DocumentInputProps {
  value: string;
  onChange: (value: string) => void;
  category?: 'PF' | 'PJ';
  placeholder?: string;
  className?: string;
  enabled?: boolean;
}

export function DocumentInput({
  value,
  onChange,
  category = 'PF',
  placeholder,
  className,
  enabled = true,
}: DocumentInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // CPF mask: 000.000.000-00
  const maskCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  // CNPJ mask: 00.000.000/0000-00
  const maskCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  // Remove mask to get only numbers
  const unmask = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  // Apply mask based on category
  const applyMask = (value: string): string => {
    const unmasked = unmask(value);
    return category === 'PF' ? maskCPF(unmasked) : maskCNPJ(unmasked);
  };

  // Validate CPF
  const validateCPF = (cpf: string): boolean => {
    const numbers = unmask(cpf);
    if (numbers.length !== 11) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(numbers)) return false;

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(numbers.charAt(9))) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(numbers.charAt(10))) return false;

    return true;
  };

  // Validate CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = unmask(cnpj);
    if (numbers.length !== 14) return false;

    // Check if all digits are the same
    if (/^(\d)\1+$/.test(numbers)) return false;

    // Validate first check digit
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(numbers.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit !== parseInt(numbers.charAt(12))) return false;

    // Validate second check digit
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(numbers.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit !== parseInt(numbers.charAt(13))) return false;

    return true;
  };

  // Update display value when value or category changes
  useEffect(() => {
    if (value) {
      const unmasked = unmask(value);
      const masked = category === 'PF' ? maskCPF(unmasked) : maskCNPJ(unmasked);
      setDisplayValue(masked);
    } else {
      setDisplayValue('');
    }
  }, [value, category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const masked = applyMask(inputValue);
    const unmasked = unmask(inputValue);

    setDisplayValue(masked);
    onChange(unmasked);
  };

  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;
    return category === 'PF' ? '000.000.000-00' : '00.000.000/0000-00';
  };

  const getMaxLength = (): number => {
    return category === 'PF' ? 14 : 18;
  };

  return (
    <Input
      type="text"
      disabled={!enabled}
      value={displayValue}
      onChange={handleChange}
      placeholder={getPlaceholder()}
      maxLength={getMaxLength()}
      className={className}
    />
  );
}
