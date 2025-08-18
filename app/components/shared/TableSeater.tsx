'use client';

import React, { ReactNode, useState, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import Link from 'next/link';
import { Edit2, LoaderCircle, MoreVertical, ArrowUpDown, Search, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { useDialog } from '../shared/dialog';

type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T, rowIndex: number, colIndex: number | string) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  conditions?: string
}

export interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T, index: number) => void;
  className?: string;
}

interface TableHeader {
  title: string;
  badge?: string;
  badgeColor?: string;
  onTitleEdit?: (title: string) => void;
  isAdmin?: boolean;
  searchPlaceholder?: string;
}

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface TableProps<T> {
  // ... existing props ...
  defaultSort?: SortConfig;
  onSearch?: (searchTerm: string) => void;
}

export interface TableFooter {
  emptyMessage?: string;
  viewMoreLink?: string;
  viewMoreText?: string;
  customActions?: React.ReactNode;
}

interface TableProps<T> {
  data: any[];
  columns: Column<T>[];
  actions?: Action<T>[];
  pageSize?: number;
  slice?: number;
  header?: TableHeader;
  footer?: TableFooter;
  loading?: boolean;
  currentPosition?: number;
  updating?: boolean;
  uniqueId?: string;
  className?: string;
  component?: ReactNode;
  defaultSort?: SortConfig;
  onSearch?: (searchTerm: string) => void;
}

export function TableComponent<T>({
  data,
  columns,
  actions,
  pageSize = 25,
  slice,
  header,
  footer,
  loading = false,
  currentPosition = -1,
  updating = false,
  uniqueId,
  className = '',
  component,
  defaultSort = { key: '', direction: "asc" },
  onSearch,
}: TableProps<T>) {
  const dialog = useDialog();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);

  // Sorting function
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      // Handle date sorting for publishedAt
      if (sortConfig.key === 'publishedAt') {
        const dateA = aValue ? new Date(aValue).getTime() : 0;
        const dateB = bValue ? new Date(bValue).getTime() : 0;
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (aValue === bValue) return 0;
      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
  }, [data, sortConfig]);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;

    return sortedData.filter(item =>
      columns.some(column => {
        if (!column.searchable) return false;
        const value = item[column.accessorKey];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [sortedData, searchTerm, columns]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const showFiltersDialog = () => {
    dialog.showDialog({
      title: "Search and Filters",
      message: "",
      type: "component",
      component: (
        <div className="space-y-4 w-full">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Sort by</h3>
            <div className="flex flex-col gap-2">
              {columns.map((column, index) => (
                column.sortable && (
                  <button
                    key={index + Math.random().toString(36).substring(2, 8)}
                    onClick={() => handleSort(String(column.accessorKey))}
                    className={`flex items-center justify-between px-4 py-2 text-sm rounded-lg hover:bg-gray-100 ${sortConfig?.key === column.accessorKey ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                      }`}
                  >
                    <span>{column.header}</span>
                    {sortConfig?.key === column.accessorKey && (
                      <ArrowUpDown className="size-4" />
                    )}
                  </button>
                )
              ))}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={header?.searchPlaceholder || "Search..."}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 size-5" />
          </div>
        </div>
      ),
    });
  };

  // If slice is provided, use it instead of pagination
  const displayData = slice ? data.slice(0, slice).sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) :
    data.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

  // Calculate pagination values
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Get current page data if not sliced
  const currentData = slice ? displayData : displayData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoaderCircle className="animate-spin size-8" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max ${clsx(className)}`}>
      {/* Header Section */}
      {header && (
        <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-200">
          <div className="relative flex flex-col lg:flex-row gap-4 items-center justify-between">
            {header.badge && (
              <span className={`absolute left-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${header.badgeColor || 'bg-orange-400 text-gray-900'}`}>
                {header.badge}
              </span>
            )}
            <h3 className={`text-sm sm:text-xl font-bold text-white flex items-center gap-2 ${header.badge && "ml-20"} uppercase`}>
              {header.title}
              {header.isAdmin && header.onTitleEdit && (
                <span
                  className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-400 text-gray-900"
                  onClick={() => header.onTitleEdit?.(header.title)}>
                  <Edit2 className="size-4" />&nbsp;Edit
                </span>
              )}
            </h3>

            {/* <div className="items-center gap-4 w-full lg:w-auto hidden lg:flex">
              <div className="flex items-center justify-center gap-4 w-full lg:w-auto">
                <div className="relative hidden lg:block flex-1 max-w-md ">
                  <input
                    type="text"
                    placeholder={header.searchPlaceholder || "Search..."}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2 pr-10 text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                  <Search className="absolute right-3 top-2.5 text-gray-400 size-5" />
                </div>
                <button
                  onClick={showFiltersDialog}
                  className="lg:hidden inline-flex items-center justify-center p-2 gap-2 rounded-lg bg-gray-800/50 text-white hover:text-white hover:bg-gray-700/50"
                >
                  Filters
                  <SlidersHorizontal className="size-5" />
                </button>
              </div>

            
              <button
                //onClick={showFiltersDialog}
                className="hidden lg:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300"
              >
                <SlidersHorizontal className="size-4" />
                Filters
              </button>
            </div>
          */}

          </div>
        </div>
      )}

      {/* Table Section */}
      <div className={`bg-white rounded-xl overflow-hidden h-max `}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index + column.header}
                    className={`px-2 py-4 text-left text-xs font-medium text-gray-900 uppercase tracking-wider ${column.accessorKey === 'publishedAt' ? 'hidden md:table-cell' : ''}`}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentData.map((item, index) => (
                <>
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors odd:bg-neutral-100"
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex + Math.random().toString(36).substring(2, 8)}
                        className={`px-2 py-2 text-sm text-gray-600 min-w-0 ${column.accessorKey === 'publishedAt' ? 'hidden md:table-cell' : ''}`}
                      >
                        <div className="break-words text-xs sm:text-sm lg:max-w-xs xl:max-w-sm 2xl:max-w-md">
                          {column.cell ? column.cell(item, index, currentData[index].id) : String(item[column.accessorKey] || '')}
                        </div>
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="relative px-2 py-2 w-10">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="focus:outline-none"
                              tabIndex={0}
                              aria-label="Show actions"
                              type="button"
                            >
                              <MoreVertical className="text-neutral-500 cursor-pointer hover:text-neutral-600 size-4 sm:size-5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className="z-50 p-0 w-40 bg-white border border-gray-200 rounded shadow-lg"
                          >
                            <div className="flex flex-col">
                              {actions.map((action, actionIndex) => (
                                <button
                                  key={actionIndex}
                                  className={`w-full flex items-center gap-2 text-left px-4 py-2 text-sm ${action.className || 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                  onClick={() => {
                                    action.onClick(item, actionIndex);
                                  }}
                                  disabled={updating && actionIndex === currentPosition}>
                                  {action.icon}
                                  {updating && actionIndex === currentPosition ? (
                                    <LoaderCircle className="animate-spin size-4" />
                                  ) : (
                                    action.label
                                  )}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                    )}
                  </tr>
                </>
              ))}
            </tbody>
          </table>

          {component && component}

        </div>

        {/* Footer Section */}
        {footer && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {!data.length && <h1 className="text-lg text-center my-8 py-4 -mx-10 bg-gray-100">{footer.emptyMessage || 'Empty List'}</h1>}
            <div className="flex items-center justify-center my-1">
              {footer.viewMoreLink && slice && data.length > slice && (
                <Link
                  href={footer.viewMoreLink}
                  className="px-4 py-2 underline underline-offset-4 text-sm font-medium text-gray-900 hover:text-orange-600 transition-all duration-300"
                >
                  {footer.viewMoreText}
                </Link>
              )}
              {footer.customActions}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!slice && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, and pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page + Math.random().toString(36).substring(2, 8)}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${currentPage === page
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page + Math.random().toString(36).substring(2, 8)}>...</span>;
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
