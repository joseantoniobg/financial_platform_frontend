import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export function YesNoField({ label, onValueChange, id, disabled, value }: { label: string; onValueChange: (value: boolean) => void; id: string, disabled?: boolean, value: string }) {
    return (<div className="space-y-2">
                <Label className="text-[hsl(var(--foreground))]">{label}</Label>
                <RadioGroup
                    value={value}
                    onValueChange={(val) => onValueChange(val === 'true')}
                    disabled={disabled}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`${id}-true`} />
                        <Label htmlFor={`${id}-true`} className="font-normal cursor-pointer">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`${id}-false`} />
                        <Label htmlFor={`${id}-false`} className="font-normal cursor-pointer">Não</Label>
                    </div>
                </RadioGroup>
            </div>);
}