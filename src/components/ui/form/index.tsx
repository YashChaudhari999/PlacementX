import { forwardRef } from 'react';

// ============================================
// Form Wrapper
// ============================================
export interface FormWrapperProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export const FormWrapper = forwardRef<HTMLFormElement, FormWrapperProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form ref={ref} className={['space-y-6', className].join(' ')} {...props}>
        {children}
      </form>
    );
  }
);
FormWrapper.displayName = 'FormWrapper';

// ============================================
// FieldWrapper
// ============================================
export interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FieldWrapper = ({ label, htmlFor, error, helperText, required, children, className }: FieldWrapperProps) => {
  return (
    <div className={['space-y-2', className].join(' ')}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </div>
  );
};

// ============================================
// Label
// ============================================
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={['text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className].join(' ')}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
    );
  }
);
Label.displayName = 'Label';

// ============================================
// ErrorMessage
// ============================================
export interface ErrorMessageProps {
  children: React.ReactNode;
  className?: string;
}

export const ErrorMessage = ({ children, className }: ErrorMessageProps) => {
  return (
    <p className={['text-sm font-medium text-destructive', className].join(' ')} role="alert">
      {children}
    </p>
  );
};

// ============================================
// HelperText
// ============================================
export interface HelperTextProps {
  children: React.ReactNode;
  className?: string;
}

export const HelperText = ({ children, className }: HelperTextProps) => {
  return (
    <p className={['text-sm text-muted-foreground', className].join(' ')}>
      {children}
    </p>
  );
};
