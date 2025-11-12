import { Plus } from "lucide-react";

export function TopAddButton({ onClick, label }: { onClick: () => void, label?: string }) {
    return (<button
            onClick={onClick}
            className="flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] px-4 py-2 rounded-lg font-medium hover:bg-[hsl(var(--primary-hover))] transition-colors"
          >
            <Plus className="h-4 w-4" />
            {label || 'Adicionar'}
          </button>);
}