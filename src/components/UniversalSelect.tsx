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
  triggerClassName = 'bg-[hsl(var(--card-accent))] border-[hsl(var(--app-border))] text-[hsl(var(--foreground-clear))]',
  contentClassName = 'bg-[hsl(var(--card-accent))]/90 border-[hsl(var(--app-border))] max-h-60',
  itemClassName = 'text-[hsl(var(--foreground-clear))] whitespace-normal break-words',
}: UniversalSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent searchable={searchable} searchPlaceholder={searchPlaceholder} className={contentClassName}>
        {items.length === 0 ? (
          <div className="p-2 text-center text-[hsl(var(--foreground-clear))] text-sm">Nenhum item</div>
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
