import { Plus } from "lucide-react";
import { Button } from "./button";

export function TopAddButton({ onClick, label }: { onClick: () => void, label?: string }) {
    return (<Button
            onClick={onClick}
          >
            <Plus className="h-4 w-4" />
            {label || 'Adicionar'}
          </Button>);
}