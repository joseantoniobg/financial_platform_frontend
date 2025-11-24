'use client';

import * as React from 'react';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface DatePickerInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: string | Date;
  onChange: (value: string) => void;
}

export const DatePickerInput = React.forwardRef<HTMLInputElement, DatePickerInputProps>(
  ({ value, onChange, className, disabled, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState<Date | undefined>(value ? new Date(typeof value === 'string' ? value + 'T00:00:00' : value) : undefined);

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

    const toISOFormat = (brDate: string): string => {
      if (!brDate) return '';
      
      const cleaned = brDate.replace(/[^\d/]/g, '');
      const parts = cleaned.split('/');
      
      if (parts.length !== 3) return '';
      
      const [day, month, year] = parts;
      
      if (day.length !== 2 || month.length !== 2 || year.length !== 4) return '';
      
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (dayNum < 1 || dayNum > 31) return '';
      if (monthNum < 1 || monthNum > 12) return '';
      if (yearNum < 1900 || yearNum > 2100) return '';
      
      return `${year}-${month}-${day}`;
    };

    const formatInput = (input: string): string => {
      const numbers = input.replace(/\D/g, '');
      let formatted = numbers;
      
      if (numbers.length >= 3) {
        formatted = numbers.slice(0, 2) + '/' + numbers.slice(2);
      }
      
      if (numbers.length >= 5) {
        formatted = numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
      }
      
      return formatted;
    };

    const getDateFromValue = (): Date | undefined => {
      if (!value) return undefined;
      
      try {
        const dateStr = typeof value === 'string' ? value : value.toISOString().split('T')[0];
        return new Date(dateStr + 'T00:00:00');
      } catch {
        return undefined;
      }
    };

    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(toBrazilianFormat(value));
      }
    }, [value, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatInput(inputValue);
      setDisplayValue(formatted);
      
      if (formatted.length === 10) {
        const isoDate = toISOFormat(formatted);
        if (isoDate) {
          onChange(isoDate);
        }
      } else if (inputValue === '') {
        onChange('');
      }
    };

    const handleCalendarSelect = (date: Date | undefined) => {
      if (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const isoDate = `${year}-${month}-${day}`;
        onChange(isoDate);
        setIsOpen(false);
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
      
      if (displayValue) {
        const isoDate = toISOFormat(displayValue);
        if (isoDate) {
          onChange(isoDate);
          setDisplayValue(toBrazilianFormat(isoDate));
        } else {
          setDisplayValue('');
          onChange('');
        }
      }
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
      }
      
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
          (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
      
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    return (
      <div className="flex gap-2">
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={10}
          placeholder="dd/mm/aaaa"
          disabled={disabled}
          className={cn(
            "bg-white dark:bg-[hsl(var(--card-accent))] border-[hsl(var(--app-border))] text-[hsl(var(--foreground))] flex-1",
            className
          )}
          {...props}
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "px-3 border-[hsl(var(--app-border))] bg-white dark:bg-[hsl(var(--card-accent))] hover:bg-gray-50 dark:hover:bg-gray-800",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4 text-slate-600 dark:text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={getDateFromValue()}
              month={currentMonth}
              onSelect={handleCalendarSelect}
              onMonthChange={(month) => setCurrentMonth(month)}
              disabled={disabled}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DatePickerInput.displayName = 'DatePickerInput';
