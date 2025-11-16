import { CurrencyInput } from "./currency-input";
import { DateInput } from "./date-input";
import { DocumentInput } from "./document-input";
import { Input } from "./input";
import { Label } from "./label";
import { PhoneInput } from "./phone-input";
import { Textarea } from "./textarea";

type FormFieldProps = {
    label: string; 
    required?: boolean; 
    disabled?: boolean, 
    htmlFor?: string; 
    id?: string; 
    value: string; 
    document?: boolean; 
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; 
    onChangeValue?: (value: string | number) => void; 
    onChangeTextArea?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    category?: 'PF' | 'PJ'; 
    date?: boolean; 
    currency?: boolean; 
    type?: string; 
    phone?: boolean; 
    textArea?: boolean;
    rows?: number;
}

export function FormField({ label, required, disabled, htmlFor, id, value, onChange, onChangeValue, onChangeTextArea, placeholder, document, date, currency, category, type, phone, textArea, rows }: FormFieldProps) {
    return (
        <>
            <Label htmlFor={htmlFor} className="text-[hsl(var(--foreground))] mb-1 block">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {!document && !date && !currency && !phone && !textArea &&
            <Input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
            />}
            {document && <>
                            <DocumentInput
                                value={value}
                                enabled={disabled}
                                onChange={onChangeValue ? onChangeValue : () => {}}
                                category={category}
                            />
                            <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                                {category === 'PF' ? 'CPF: 000.000.000-00' : 'CNPJ: 00.000.000/0000-00'}
                            </p>
                        </>}
            {date && <DateInput
                        id={id}
                        value={value}
                        onChange={onChangeValue ? onChangeValue : () => {}}
                        disabled={disabled}
                    />}
            {currency && <CurrencyInput
                            value={value}
                            onChange={onChangeValue ? onChangeValue : () => {}}
                            disabled={disabled}
                        />}
            {phone &&  <PhoneInput
                            id={id}
                            value={value}
                            onChange={onChangeValue ? onChangeValue : () => {}}
                            disabled={disabled}
                        />}
            {textArea && <Textarea
                            id={id}
                            value={value}
                            onChange={onChangeTextArea ? onChangeTextArea : () => {}}
                            disabled={disabled}
                            placeholder={placeholder}
                            rows={rows}
                         />}

        </>
    );
}