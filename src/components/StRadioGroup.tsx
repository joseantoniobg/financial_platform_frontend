import { Label } from "recharts";

export function StRadioGroup({ label, name, options, selected, onChange, disabled }: { label: string; name: string; options: { id: string; description: string }[], selected: string, onChange: (value: string) => void, disabled?: boolean }) {
    return ( <div className="space-y-2">
            <Label className="text-[hsl(var(--foreground))]">{label}</Label>
            <div className="flex flex-col gap-2">
              {options.map((option) => (
                <label key={option.id} className="flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <input
                    type="radio"
                    name={name}
                    value={option.id}
                    checked={selected === option.id}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                  />
                  <span>{option.description}</span>
                </label>
              ))}
            </div>
          </div>);
}