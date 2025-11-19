import { Button } from "./ui/button";

export function StTableActions({ onEdit, onDelete, }: { onEdit: () => void; onDelete: () => void; }) {
    return (<div className="flex justify-end gap-2">
                <Button type="button" variant="edit" size="sm" onClick={onEdit}>Editar</Button>
                <Button type="button" variant="destructive" size="sm" onClick={onDelete}>Excluir</Button>
            </div>);
}