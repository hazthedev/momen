/**
 * Momen Table Components
 * Interactive tables with sorting, filtering, and pagination
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
} from 'lucide-react';

/* ============================================
   TABLE ROOT COMPONENT
   ============================================ */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));

Table.displayName = 'Table';

/* ============================================
   TABLE HEADER
   ============================================ */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('[&_tr]:border-b', className)}
    {...props}
  />
));

TableHeader.displayName = 'TableHeader';

/* ============================================
   TABLE BODY
   ============================================ */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      '[&_tr:last-child]:border-0',
      '[&_tr]:border-b',
      '[&_tr]:border-default',
      className
    )}
    {...props}
  />
));

TableBody.displayName = 'TableBody';

/* ============================================
   TABLE FOOTER
   ============================================ */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-default bg-cream/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
));

TableFooter.displayName = 'TableFooter';

/* ============================================
   TABLE ROW
   ============================================ */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    isSelected?: boolean;
  }
>(({ className, isSelected, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'transition-colors duration-150',
      'hover:bg-table-hover',
      isSelected && 'bg-table-selected',
      '[&[data-state=selected]]:bg-table-selected',
      'data-[state=selected]:bg-table-selected',
      className
    )}
    data-state={isSelected ? 'selected' : undefined}
    {...props}
  />
));

TableRow.displayName = 'TableRow';

/* ============================================
   TABLE HEAD (HEADER CELL)
   ============================================ */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-on-dark',
      '[&[align=center]]:text-center [&[align=right]]:text-right',
      'bg-slate',
      ' whitespace-nowrap'
    )}
    {...props}
  />
));

TableHead.displayName = 'TableHead';

/* ============================================
   TABLE CELL
   ============================================ */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 align-middle',
      '[&[align=center]]:text-center [&[align=right]]:text-right',
      'text-slate',
      className
    )}
    {...props}
  />
));

TableCell.displayName = 'TableCell';

/* ============================================
   TABLE CAPTION
   ============================================ */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-sky', className)}
    {...props}
  />
));

TableCaption.displayName = 'TableCaption';

/* ============================================
   SORTABLE TABLE HEAD
   ============================================ */
export interface SortableTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  column: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (column: string) => void;
  children: React.ReactNode;
}

const SortableTableHead = React.forwardRef<
  HTMLTableCellElement,
  SortableTableHeadProps
>(
  (
    { column, sortColumn, sortDirection, onSort, children, className, ...props },
    ref
  ) => {
    return (
      <TableHead
        ref={ref}
        className={cn(
          'cursor-pointer hover:bg-white/5 select-none transition-colors',
          'user-select-none',
          className
        )}
        onClick={() => onSort?.(column)}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortColumn === column ? (
            sortDirection === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )
          ) : (
            <ChevronsUpDown className="w-4 h-4 opacity-30" />
          )}
        </div>
      </TableHead>
    );
  }
);

SortableTableHead.displayName = 'SortableTableHead';

/* ============================================
   ACTIONS CELL (Dropdown)
   ============================================ */
export interface TableActionsCellProps {
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }[];
}

const TableActionsCell = React.forwardRef<
  HTMLTableCellElement,
  TableActionsCellProps
>(({ actions }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <TableCell ref={ref} className="w-[50px] p-2">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-8 h-8 rounded-md',
            'flex items-center justify-center',
            'text-sky hover:text-slate hover:bg-cream',
            'transition-colors duration-150'
          )}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {isOpen && (
          <div
            className={cn(
              'absolute right-0 top-full mt-1',
              'min-w-[160px]',
              'bg-card',
              'border border-default',
              'rounded-md',
              'shadow-lg',
              'py-1',
              'z-10',
              'animate-in fade-in slide-in-from-top-1'
            )}
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-2',
                  'text-left text-sm',
                  'flex items-center gap-2',
                  'transition-colors duration-150',
                  action.variant === 'danger'
                    ? 'text-error hover:bg-error-light'
                    : 'text-slate hover:bg-cream'
                )}
              >
                {action.icon && (
                  <span className="flex-shrink-0 w-4 h-4">
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </TableCell>
  );
});

TableActionsCell.displayName = 'TableActionsCell';

/* ============================================
   EMPTY STATE
   ============================================ */
export interface TableEmptyStateProps {
  colSpan: number;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

const TableEmptyState = React.forwardRef<
  HTMLTableRowElement,
  TableEmptyStateProps
>(({ colSpan, title, description, action, icon }, ref) => {
  const defaultIcon = (
    <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-sky/40">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>
  );

  return (
    <tr ref={ref}>
      <TableCell colSpan={colSpan} className="h-32">
        <div className="flex flex-col items-center justify-center gap-3">
          {icon || defaultIcon}
          <div className="text-center">
            <p className="font-medium text-slate">{title}</p>
            {description && (
              <p className="text-sm text-sky mt-1">{description}</p>
            )}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 px-4 py-2 text-sm font-medium bg-slate text-white rounded-md hover:bg-slate-900 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      </TableCell>
    </tr>
  );
});

TableEmptyState.displayName = 'TableEmptyState';

/* ============================================
   LOADING ROWS (SKELETON)
   ============================================ */
export interface TableLoadingRowsProps {
  rows?: number;
  columns: number;
}

const TableLoadingRows = ({ rows = 5, columns }: TableLoadingRowsProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-4 w-full max-w-[200px] rounded bg-gradient-shimmer bg-[length:200%_100%] animate-shimmer" />
            </TableCell>
          ))}
        </tr>
      ))}
    </>
  );
};

TableLoadingRows.displayName = 'TableLoadingRows';

/* ============================================
   PAGINATION COMPONENT
   ============================================ */
export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

const TablePagination = React.forwardRef<
  HTMLDivElement,
  TablePaginationProps
>(
  (
    {
      currentPage,
      totalPages,
      pageSize,
      totalItems,
      onPageChange,
      onPageSizeChange,
      pageSizeOptions = [10, 25, 50, 100],
    },
    ref
  ) => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);

      return pages;
    };

    return (
      <div
        ref={ref}
        className="flex items-center justify-between px-4 py-3 border-t border-default"
      >
        {/* Showing X to Y of Z */}
        <div className="text-sm text-sky">
          Showing <span className="font-medium text-slate">{startItem}</span> to{' '}
          <span className="font-medium text-slate">{endItem}</span> of{' '}
          <span className="font-medium text-slate">{totalItems}</span> results
        </div>

        <div className="flex items-center gap-4">
          {/* Page size selector */}
          {onPageSizeChange && (
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-default px-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ice/50"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          )}

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                'w-8 h-8 rounded-md',
                'flex items-center justify-center',
                'transition-colors duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                currentPage === 1
                  ? 'text-sky cursor-not-allowed'
                  : 'text-slate hover:bg-cream'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="w-8 h-8 flex items-center justify-center text-sky">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={cn(
                      'w-8 h-8 rounded-md',
                      'text-sm font-medium',
                      'transition-colors duration-150',
                      currentPage === page
                        ? 'bg-slate text-white'
                        : 'text-slate hover:bg-cream'
                    )}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                'w-8 h-8 rounded-md',
                'flex items-center justify-center',
                'transition-colors duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                currentPage === totalPages
                  ? 'text-sky cursor-not-allowed'
                  : 'text-slate hover:bg-cream'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

TablePagination.displayName = 'TablePagination';

/* ============================================
   EXPORTS
   ============================================ */
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  SortableTableHead,
  TableActionsCell,
  TableEmptyState,
  TableLoadingRows,
  TablePagination,
};
