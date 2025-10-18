"use client"

import * as React from 'react'
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select'

export type UniversalSelectItem = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface UniversalSelectProps {
  value: string
  onChange: (value: string) => void
  items: UniversalSelectItem[]
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
  disabled?: boolean
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
}

export function UniversalSelect({
  value,
  onChange,
  items,
  placeholder = 'Select...',
  searchable = false,
  searchPlaceholder = 'Buscar...',
  disabled = false,
  triggerClassName = 'bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white',
  contentClassName = 'bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600 max-h-60',
  itemClassName = 'text-slate-800 dark:text-white whitespace-normal break-words',
}: UniversalSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent searchable={searchable} searchPlaceholder={searchPlaceholder} className={contentClassName}>
        {items.length === 0 ? (
          <div className="p-2 text-center text-gray-500 dark:text-gray-400 text-sm">Nenhum item</div>
        ) : (
          items.map((it) => (
            <SelectItem key={it.value} value={it.value} className={itemClassName} disabled={it.disabled}>
              {it.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

export default UniversalSelect
