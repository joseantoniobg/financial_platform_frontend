
import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Label } from './ui/label';

const StMultiSelect = ({ label, htmlFor, required, items, onChange }: { label: string; htmlFor: string; required?: boolean; items: { id: string; label: string }[]; onChange: (selectedItems: { id: string; label: string }[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ id: string; label: string }[]>([]);

  const toggleItem = (item: { id: string; label: string }) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      }
      onChange([...prev, item]);
      return [...prev, item];
    });
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(prev => {
      const updatedItems = prev.filter(i => i.id !== itemId);
      onChange(updatedItems);
      return updatedItems;
    });
  };

  const isSelected = (itemId: string) => {
    return selectedItems.some(i => i.id === itemId);
  };

  return (
    <div className="w-full">
      <Label htmlFor={htmlFor} className="text-[hsl(var(--foreground))] mb-1 block">
          {label} {required && <span className="text-red-500">*</span>} {selectedItems.length > 0 && <span className='text-sm text-[hsl(var(--muted-foreground))] italic'>{selectedItems.length} ite{selectedItems.length !== 1 ? 'ns' : 'm'} selecionado{selectedItems.length !== 1 ? 's' : ''}</span>}
      </Label>
      <div>
          <div 
          className="bg-[hsl(var(--card-accent))] border border-[hsl(var(--app-border))] text-[hsl(var(--foreground))] p-1 min-h-10 rounded-lg cursor-pointer relative"
          onClick={() => setIsOpen(!isOpen)}
          >
              <div className="flex items-center justify-between">
                  <div className="flex-1 flex flex-wrap gap-2">
                  {selectedItems.length === 0 ? (
                      <span className="text-[hsl(var(--muted-foreground))] mt-1 ml-2">Selecionar...</span>
                  ) : (
                      selectedItems.map(item => (
                      <span 
                          key={item.id}
                          className="inline-flex items-center gap-1 bg-[hsl(var(--primary))] text-[hsl(var(--nav-foreground))] border border-[hsl(var(--primary-foreground))] px-2 py-1 rounded text-sm font-medium"
                          onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                          }}
                      >
                          {item.label}
                          <X size={14} className="cursor-pointer hover:text-blue-900" />
                      </span>
                      ))
                  )}
                  </div>
                  <ChevronDown 
                  size={20} 
                  className={`text-[hsl(var(--muted-foreground))] transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`}
                  />
              </div>
          </div>
          {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-[hsl(var(--card-accent))] border border-[hsl(var(--app-border))] rounded-lg shadow-lg max-h-40 overflow-y-scroll max-w-md">
              {items.map(item => (
              <div
                  key={item.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-[hsl(var(--background))]/40 transition-colors ${
                  isSelected(item.id) ? 'bg-[hsl(var(--card))]' : ''
                  }`}
                  onClick={() => toggleItem(item)}
              >
                  <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      isSelected(item.id) 
                      ? 'bg-[hsl(var(--nav-background))] border-[hsl(var(--nav-foreground))]' 
                      : 'border-[hsl(var(--muted-foreground))]'
                  }`}>
                      {isSelected(item.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      )}
                  </div>
                  <span className={`${isSelected(item.id) ? 'font-medium text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                      {item.label}
                  </span>
                  </div>
              </div>
              ))}
          </div>
          )}
      </div>
    </div>
  );
};

export default StMultiSelect;