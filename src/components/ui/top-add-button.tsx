import { Plus } from "lucide-react";
import { Button } from "./button";

export function TopAddButton({ id, onClick, label }: { id: string, onClick: () => void, label?: string }) {
    return (<Button
            id={id}
            onClick={onClick}
          >
            <Plus className="h-4 w-4" />
            {label || 'Adicionar'}
          </Button>);
}