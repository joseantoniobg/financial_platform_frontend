# Brazilian Currency Input Component

## Overview
A reusable React component for Brazilian currency (BRL) input with proper locale formatting.

## Features
- ✅ Brazilian locale formatting (pt-BR)
- ✅ Comma (,) as decimal separator
- ✅ Dot (.) as thousands separator  
- ✅ R$ prefix
- ✅ Automatic formatting on blur
- ✅ Allows up to 2 decimal places
- ✅ Dark mode support
- ✅ Keyboard navigation support
- ✅ Select all text on focus

## Installation
The component is located at:
```
/src/components/ui/currency-input.tsx
```

## Usage

### Basic Example
```tsx
import { CurrencyInput } from '@/components/ui/currency-input';
import { useState } from 'react';

function MyComponent() {
  const [price, setPrice] = useState(0);

  return (
    <CurrencyInput
      value={price}
      onChange={(value) => setPrice(value)}
      placeholder="0,00"
    />
  );
}
```

### With Form
```tsx
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';

function PriceForm() {
  const [formData, setFormData] = useState({
    price: 0,
    name: ''
  });

  return (
    <form>
      <div className="space-y-2">
        <Label htmlFor="price">
          Preço <span className="text-red-500">*</span>
        </Label>
        <CurrencyInput
          id="price"
          value={formData.price}
          onChange={(value) => setFormData({ ...formData, price: value })}
          placeholder="0,00"
          className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600"
        />
      </div>
    </form>
  );
}
```

### With String Value (for API compatibility)
```tsx
import { CurrencyInput } from '@/components/ui/currency-input';

function ServicePricing() {
  const [formData, setFormData] = useState({
    price: ''  // API expects string
  });

  return (
    <CurrencyInput
      value={formData.price}
      onChange={(value) => setFormData({ ...formData, price: value.toString() })}
      placeholder="0,00"
    />
  );
}
```

### Disabled State
```tsx
<CurrencyInput
  value={price}
  onChange={setPrice}
  disabled={true}
  placeholder="0,00"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| string` | - | Current value (required) |
| `onChange` | `(value: number) => void` | - | Callback when value changes (required) |
| `locale` | `string` | `'pt-BR'` | Locale for formatting |
| `currency` | `string` | `'BRL'` | Currency code |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable input |
| `placeholder` | `string` | - | Placeholder text |
| `...props` | `InputHTMLAttributes` | - | All other standard input props |

## Behavior

### Input Formatting
- **While typing**: Shows raw input with comma as decimal separator
- **On blur**: Formats to Brazilian currency style (1.234,56)
- **On focus**: Selects all text for easy editing

### Examples
```
User types: 1500      → Displays: 1.500,00
User types: 1500,5    → Displays: 1.500,50
User types: 1500,99   → Displays: 1.500,99
User types: 0,5       → Displays: 0,50
```

### Value Conversion
The component handles conversion between display format and numeric value:
```tsx
// Display: R$ 1.500,50
// onChange receives: 1500.5 (number)

// Display: R$ 0,99
// onChange receives: 0.99 (number)
```

## Integration Examples

### PricingDialog (Already Implemented)
```tsx
<CurrencyInput
  id="price"
  value={formData.price}
  onChange={(value) => setFormData({ ...formData, price: value.toString() })}
  className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
  placeholder="0,00"
  disabled={submitting}
/>
```

### Transaction Form (Example)
```tsx
function TransactionForm() {
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ amount }), // amount is already a number
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Label>Valor</Label>
      <CurrencyInput
        value={amount}
        onChange={setAmount}
        placeholder="0,00"
      />
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### Service Pricing (Example)
```tsx
function ServicePriceEditor() {
  const [price, setPrice] = useState(0);

  return (
    <div className="space-y-2">
      <Label>Preço do Serviço</Label>
      <CurrencyInput
        value={price}
        onChange={setPrice}
        placeholder="0,00"
        className="bg-white dark:bg-[#0D2744]"
      />
      <p className="text-sm text-gray-500">
        Valor: {price.toFixed(2)}
      </p>
    </div>
  );
}
```

## Best Practices

1. **Use number type for state** when possible for easier calculations:
   ```tsx
   const [price, setPrice] = useState(0); // ✅ Good
   const [price, setPrice] = useState(''); // ⚠️ Only if API requires string
   ```

2. **Convert to string only when needed for API**:
   ```tsx
   onChange={(value) => setFormData({ ...formData, price: value.toString() })}
   ```

3. **Validate on submit**, not on change:
   ```tsx
   const handleSubmit = () => {
     if (price < 0) {
       toast.error('Preço deve ser positivo');
       return;
     }
     // Submit...
   };
   ```

4. **Use with form validation libraries**:
   ```tsx
   // With react-hook-form
   <Controller
     name="price"
     control={control}
     rules={{ min: 0, required: true }}
     render={({ field }) => (
       <CurrencyInput
         value={field.value}
         onChange={field.onChange}
       />
     )}
   />
   ```

## Styling

The component accepts all standard className props and integrates with your Tailwind classes:

```tsx
<CurrencyInput
  value={price}
  onChange={setPrice}
  className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
/>
```

## Future Use Cases

This component can be used in:
- ✅ Service pricing forms (Already implemented)
- Transaction amount inputs
- Budget/expense forms
- Invoice line items
- Salary/payment inputs
- Any monetary value input in your application
