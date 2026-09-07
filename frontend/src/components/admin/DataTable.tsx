import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Download,
    Columns,
    Maximize2,
    Minimize2
} from 'lucide-react';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}

export interface BulkAction<T> {
    label: string;
    onClick: (selectedIds: (string | number)[]) => void;
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    totalItems?: number;
    onPageChange?: (page: number) => void;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    onExport?: () => void;
    onSearch?: (query: string) => void;
    onSelectionChange?: (selectedIds: (string | number)[]) => void;
    bulkActions?: BulkAction<T>[];
    itemsPerPage?: number;
    searchable?: boolean;
    exportable?: boolean;
    selectable?: boolean;
    loading?: boolean;
    expandable?: boolean;
    renderExpandedRow?: (row: T) => React.ReactNode;
}

interface SortConfig {
    key: string | null;
    direction: 'asc' | 'desc';
}

export function DataTable<T extends { id?: string | number } & Record<string, any>>({
    columns,
    data,
    totalItems,
    onPageChange,
    onSort,
    onExport,
    onSearch,
    onSelectionChange,
    bulkActions = [],
    itemsPerPage = 10,
    searchable = true,
    exportable = true,
    selectable = false,
    loading = false,
    expandable = false,
    renderExpandedRow = null
}: DataTableProps<T>) {
    // State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
    const [density, setDensity] = useState<'normal' | 'compact'>('normal');
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
        columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {} as Record<string, boolean>)
    );
    const [showColumnToggle, setShowColumnToggle] = useState<boolean>(false);
    const [expandedRows, setExpandedRows] = useState<(string | number)[]>([]);

    const handleExpandRow = (id: string | number) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    // Derived State
    const isServerSide = typeof totalItems === 'number';

    // Client-side filtering and sorting
    const filteredData = React.useMemo(() => {
        if (isServerSide) return data;

        let processed = [...data];

        if (searchQuery) {
            processed = processed.filter(row =>
                columns.some(col =>
                    String(row[col.key] || '')
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                )
            );
        }

        if (sortConfig.key) {
            processed.sort((a, b) => {
                const aVal = a[sortConfig.key!];
                const bVal = b[sortConfig.key!];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processed;
    }, [data, searchQuery, sortConfig, columns, isServerSide]);

    // Client-side pagination
    const paginatedData = React.useMemo(() => {
        if (isServerSide) return data;
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage, isServerSide, data]);

    const displayData = isServerSide ? data : paginatedData;
    const totalCount = isServerSide ? totalItems || 0 : filteredData.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Handlers
    const handleSort = (key: string) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
        if (onSort) onSort(key, direction);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setCurrentPage(1);
        if (onSearch) onSearch(query);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (onPageChange) onPageChange(page);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(displayData.map(row => row.id!).filter(id => id !== undefined));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string | number) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        if (onSelectionChange) onSelectionChange(selectedRows);
    }, [selectedRows, onSelectionChange]);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm">
                {/* Search */}
                {searchable && (
                    <div className="relative flex-1 max-w-md w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Bulk Actions */}
                    {selectedRows.length > 0 && bulkActions.length > 0 && (
                        <div className="flex items-center gap-2 mr-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-3 py-1.5 rounded-lg">
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{selectedRows.length} selected</span>
                            <div className="h-4 w-px bg-purple-200 dark:bg-purple-800 mx-1"></div>
                            {bulkActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => action.onClick(selectedRows)}
                                    className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Density Toggle */}
                    <button
                        onClick={() => setDensity(d => d === 'normal' ? 'compact' : 'normal')}
                        className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-gray-200/60 dark:border-slate-700/60"
                        title="Toggle Density"
                    >
                        {density === 'normal' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>

                    {/* Column Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnToggle(!showColumnToggle)}
                            className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-gray-200/60 dark:border-slate-700/60"
                            title="Columns"
                        >
                            <Columns size={18} />
                        </button>

                        {showColumnToggle && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 p-3 z-20 animate-scale-in">
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">Visible Columns</h4>
                                {columns.map(col => (
                                    <label key={col.key} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[col.key]}
                                            onChange={(e) => setVisibleColumns(prev => ({ ...prev, [col.key]: e.target.checked }))}
                                            className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-slate-200">{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Export */}
                    {exportable && (
                        <button
                            onClick={() => onExport && onExport()}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-slate-800 overflow-hidden relative">

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 hidden md:table-header-group">
                            <tr>
                                {expandable && <th className="px-6 py-3 w-4"></th>}
                                {selectable && (
                                    <th className="px-6 py-3 w-4">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={displayData.length > 0 && selectedRows.length === displayData.length}
                                            className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                                        />
                                    </th>
                                )}
                                {columns.filter(col => visibleColumns[col.key]).map(col => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable !== false && handleSort(col.key)}
                                        className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer hover:bg-gray-100/70 dark:hover:bg-slate-700/60 transition-colors' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            {col.sortable !== false && sortConfig.key === col.key && (
                                                <span className="text-purple-600 dark:text-purple-400">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 block md:table-row-group">
                            {loading ? (
                                [...Array(itemsPerPage)].map((_, idx) => (
                                    <tr key={`skeleton-${idx}`} className="animate-pulse block md:table-row mb-4 md:mb-0 border md:border-none rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0">
                                        {expandable && <td className="px-6 py-4 w-4 hidden md:table-cell"><div className="h-4 w-4 bg-gray-200 dark:bg-slate-700 rounded"></div></td>}
                                        {selectable && (
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="h-4 w-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                                            </td>
                                        )}
                                        {columns.filter(col => visibleColumns[col.key]).map((col, colIdx) => (
                                            <td key={`skeleton-col-${colIdx}`} className="px-6 py-4 block md:table-cell flex justify-between">
                                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : displayData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 block md:table-cell">
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                displayData.map((row, idx) => (
                                    <React.Fragment key={row.id || idx}>
                                        <tr
                                            className={`hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors block md:table-row mb-4 md:mb-0 border md:border-none border-gray-200 dark:border-slate-800 rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 ${row.id && selectedRows.includes(row.id) ? 'bg-purple-50/30 dark:bg-purple-950/30' : ''} ${row.id && expandedRows.includes(row.id) ? 'bg-gray-50/60 dark:bg-slate-800/40' : ''}`}
                                            onClick={() => expandable && row.id && handleExpandRow(row.id)}
                                        >
                                            {expandable && (
                                                <td className="px-6 py-4 w-4 cursor-pointer hidden md:table-cell">
                                                    {row.id && expandedRows.includes(row.id) ? <ChevronDown size={16} className="text-gray-500 dark:text-slate-400" /> : <ChevronRight size={16} className="text-gray-400 dark:text-slate-500" />}
                                                </td>
                                            )}
                                            {selectable && (
                                                <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'} hidden md:table-cell`} onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!(row.id && selectedRows.includes(row.id))}
                                                        onChange={() => row.id && handleSelectRow(row.id)}
                                                        className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                                                    />
                                                </td>
                                            )}
                                            {/* Mobile Select/Expand Header */}
                                            <td className="md:hidden pb-2 mb-2 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {selectable && (
                                                        <input
                                                            type="checkbox"
                                                            checked={!!(row.id && selectedRows.includes(row.id))}
                                                            onChange={(e) => { e.stopPropagation(); row.id && handleSelectRow(row.id); }}
                                                            className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                                                        />
                                                    )}
                                                    <span className="font-medium text-gray-900 dark:text-slate-100">#{row.id}</span>
                                                </div>
                                                {expandable && (
                                                    <button onClick={(e) => { e.stopPropagation(); row.id && handleExpandRow(row.id); }}>
                                                        {row.id && expandedRows.includes(row.id) ? <ChevronDown size={16} className="text-gray-500 dark:text-slate-400" /> : <ChevronRight size={16} className="text-gray-400 dark:text-slate-500" />}
                                                    </button>
                                                )}
                                            </td>

                                            {columns.filter(col => visibleColumns[col.key]).map(col => (
                                                <td key={col.key} className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'} text-sm text-gray-700 dark:text-slate-200 block md:table-cell flex justify-between items-center md:block`}>
                                                    <span className="md:hidden font-medium text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">{col.label}</span>
                                                    <span className="text-right md:text-left">
                                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                        {expandable && row.id && expandedRows.includes(row.id) && renderExpandedRow && (
                                            <tr className="bg-gray-50/60 dark:bg-slate-800/30 block md:table-row">
                                                <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 shadow-inner block md:table-cell text-gray-700 dark:text-slate-200">
                                                    {renderExpandedRow(row)}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200/80 dark:border-slate-800 flex items-center justify-between bg-gray-50/70 dark:bg-slate-900/60">
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                        Showing <span className="font-medium text-gray-900 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-medium text-gray-900 dark:text-slate-200">{totalCount}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || loading}
                            className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                // Simple pagination logic
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 2 + i;
                                }
                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        disabled={loading}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                            ? 'bg-purple-600 text-white shadow-sm'
                                            : 'hover:bg-white dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataTable;
