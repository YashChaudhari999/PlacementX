import { forwardRef, useRef } from 'react';
import { Upload, User, FileText, Image as ImageIcon, X } from 'lucide-react';

// ============================================
// FileUpload
// ============================================
export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  onFilesSelected?: (files: FileList) => void;
  label?: string;
  description?: string;
  error?: string;
  className?: string;
}

export const FileUpload = ({
  accept,
  multiple,
  onFilesSelected,
  label = 'Upload File',
  description,
  error,
  className,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className={[
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted cursor-pointer',
        error ? 'border-destructive' : '',
        className,
      ].join(' ')}
      onClick={() => inputRef.current?.click()}
    >
      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">{label}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => e.target.files && onFilesSelected?.(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

// ============================================
// AvatarUpload
// ============================================
export interface AvatarUploadProps {
  currentUrl?: string;
  onFileSelected?: (file: File) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const avatarSizes = { sm: 'h-16 w-16', md: 'h-24 w-24', lg: 'h-32 w-32' };

export const AvatarUpload = ({
  currentUrl,
  onFileSelected,
  size = 'md',
  className,
}: AvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={['relative inline-block', className].join(' ')}>
      <div
        className={[
          'flex items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted cursor-pointer hover:border-primary/50 transition-colors',
          avatarSizes[size],
        ].join(' ')}
        onClick={() => inputRef.current?.click()}
      >
        {currentUrl ? (
          <img src={currentUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <User className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFileSelected?.(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

// ============================================
// ResumeUpload (placeholder architecture)
// ============================================
export interface ResumeUploadProps {
  currentFileName?: string;
  onFileSelected?: (file: File) => void;
  error?: string;
  className?: string;
}

export const ResumeUpload = ({
  currentFileName,
  onFileSelected,
  error,
  className,
}: ResumeUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={['rounded-lg border border-border bg-card p-4', className].join(' ')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{currentFileName || 'No resume uploaded'}</p>
            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 5MB)</p>
          </div>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent cursor-pointer"
        >
          {currentFileName ? 'Replace' : 'Upload'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => e.target.files?.[0] && onFileSelected?.(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

// ============================================
// ImagePreview
// ============================================
export interface ImagePreviewProps {
  src: string;
  alt?: string;
  onRemove?: () => void;
  className?: string;
}

export const ImagePreview = ({ src, alt = 'Preview', onRemove, className }: ImagePreviewProps) => {
  return (
    <div
      className={[
        'relative inline-block overflow-hidden rounded-md border border-border',
        className,
      ].join(' ')}
    >
      <img src={src} alt={alt} className="h-32 w-32 object-cover" />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
