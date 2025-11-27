import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function StSelect({ items, value, onChange, loading, htmlFor, label, searchable = true, required }: { label: string; htmlFor: string; items: { id: string; description: string }[]; value: string; onChange: (value: string) => void; loading: boolean; searchable?: boolean; required?: boolean }) {
    return (<div>
              <Label htmlFor={htmlFor} className="text-[hsl(var(--foreground))] mb-1 block">
                {label} {required && <span className="text-red-500">*</span>}
              </Label>
              <Select
                value={value}
                onValueChange={onChange}
                disabled={loading}
              >
                <SelectTrigger className="bg-[hsl(var(--card-accent))] border-[hsl(var(--app-border))] text-[hsl(var(--foreground))]">
                  <SelectValue placeholder={loading ? "Carregando..." : "Selecione..."} />
                </SelectTrigger>
                <SelectContent searchable={searchable} className="bg-[hsl(var(--card-accent))] border-[hsl(var(--border))]">
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id} className="text-[hsl(var(--foreground))]">
                      {item.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>);
}