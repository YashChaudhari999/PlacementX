import { forwardRef } from 'react';

// ============================================
// Select
// ============================================
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={[
          'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-destructive' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

// ============================================
// Checkbox
// ============================================
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          ref={ref}
          id={id}
          className={[
            'h-4 w-4 shrink-0 rounded border border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          ].join(' ')}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// ============================================
// Radio
// ============================================
export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export const RadioGroup = ({ name, options, value, onChange, className, direction = 'vertical' }: RadioGroupProps) => {
  return (
    <div className={[direction === 'horizontal' ? 'flex items-center space-x-4' : 'flex flex-col space-y-2', className].join(' ')}>
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center space-x-2 text-sm">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange?.(opt.value)}
            disabled={opt.disabled}
            className="h-4 w-4 border border-border text-primary focus:ring-ring"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

// ============================================
// Switch
// ============================================
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          role="switch"
          className={[
            'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
            className,
          ].join(' ')}
          {...(props as any)}
        >
          <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform" />
        </button>
        {label && <label htmlFor={id} className="text-sm font-medium">{label}</label>}
      </div>
    );
  }
);
Switch.displayName = 'Switch';

// ============================================
// Autocomplete (placeholder architecture)
// ============================================
export interface AutocompleteProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Autocomplete = ({ options, value, onChange, placeholder, className }: AutocompleteProps) => {
  // Architecture placeholder — will use Headless UI / Downshift in implementation
  return (
    <div className={['relative w-full', className].join(' ')}>
      <input
        type="text"
        className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {/* Dropdown list renders here */}
    </div>
  );
};
