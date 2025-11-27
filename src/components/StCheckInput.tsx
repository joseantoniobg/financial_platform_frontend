import { Label } from "./ui/label";

export function StCheckInput({ id, label, checked, onChange, disabled }: { id: string; label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
    return (<div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={id}
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-[hsl(var(--app-border))] text-[hsl(var(--primary))] focus:ring-0 focus:ring-offset-0 focus:ring-[hsl(var(--primary))]"
              disabled={disabled}
            />
            <Label htmlFor={id} className="text-[hsl(var(--foreground))] cursor-pointer">
              {label}
            </Label>
          </div>);
}