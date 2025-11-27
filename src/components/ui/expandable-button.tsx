import { ChevronDown, ChevronRight } from "lucide-react";

export function ExpandableButton({ isExpanded, onClick }: { isExpanded: boolean; onClick: () => void }) {
    return (
                <button
                    onClick={onClick}
                    type="button"
                    className="p-1 bg-[hsl(var(--hover))]/10 rounded-md hover:bg-[hsl(var(--hover))]/40 transition-colors flex items-center justify-center"
                    title={isExpanded ? 'Recolher' : 'Expandir'}
                >
                {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-[hsl(var(--foreground))]" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-[hsl(var(--foreground))]" />
                )}
                </button>)
}