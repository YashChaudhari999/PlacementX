import { forwardRef } from 'react';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  ArrowUpDownIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Search01Icon,
  Cancel01Icon,
} from 'hugeicons-react';

// ============================================
// DataTable — Enterprise Component
// ============================================

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (column: string) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data available.',
  sortColumn,
  sortDirection,
  onSort,
  className,
}: DataTableProps<T>) {
  const getSortIcon = (col: ColumnDef<T>) => {
    if (!col.sortable) return null;
    if (sortColumn === col.key) {
      return sortDirection === 'asc' ? (
        <ArrowUp01Icon className="h-4 w-4" />
      ) : (
        <ArrowDown01Icon className="h-4 w-4" />
      );
    }
    return <ArrowUpDownIcon className="h-4 w-4 opacity-50" />;
  };

  return (
    <div className={['w-full overflow-auto rounded-md border border-border', className].join(' ')}>
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                  col.sortable ? 'cursor-pointer select-none hover:text-foreground' : '',
                  col.className,
                ].join(' ')}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center space-x-2">
                  <span>{col.header}</span>
                  {getSortIcon(col)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                <TableLoadingState columns={columns.length} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                <TableEmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                {columns.map((col) => (
                  <td key={col.key} className={['p-4 align-middle', col.className].join(' ')}>
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Pagination
// ============================================
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  return (
    <div className={['flex items-center justify-between px-2 py-4', className].join(' ')}>
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50"
        >
          <ArrowLeftDoubleIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50"
        >
          <ArrowLeft01Icon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50"
        >
          <ArrowRight01Icon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent disabled:opacity-50"
        >
          <ArrowRightDoubleIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// Table Sub-Components
// ============================================
export const TableEmptyState = ({ message = 'No data available.' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
    <p className="text-sm">{message}</p>
  </div>
);

export const TableLoadingState = ({ columns = 4 }: { columns?: number }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="h-4 flex-1 animate-pulse rounded bg-muted" />
        ))}
      </div>
    ))}
  </div>
);

export const TableSearch = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  placeholder?: string;
}) => (
  <div className="relative w-full max-w-sm">
    <Search01Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex h-10 w-full rounded-md border border-border bg-background pl-10 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
    {value && (
      <button
        onClick={onClear}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <Cancel01Icon className="h-4 w-4" />
      </button>
    )}
  </div>
);
