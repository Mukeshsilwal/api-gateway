import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Download,
    Columns,
    MoreHorizontal,
    Maximize2,
    Minimize2,
    Filter
} from 'lucide-react';

export function DataTable({
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
}) {
    // State
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [density, setDensity] = useState('normal'); // normal, compact
    const [visibleColumns, setVisibleColumns] = useState(
        columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    );
    const [showColumnToggle, setShowColumnToggle] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);

    const handleExpandRow = (id) => {
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
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
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
    const totalCount = isServerSide ? totalItems : filteredData.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Handlers
    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
        if (onSort) onSort(key, direction);
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setCurrentPage(1);
        if (onSearch) onSearch(query);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (onPageChange) onPageChange(page);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(displayData.map(row => row.id)); // Assuming row has 'id'
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id) => {
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                {/* Search */}
                {searchable && (
                    <div className="relative flex-1 max-w-md w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Bulk Actions */}
                    {selectedRows.length > 0 && bulkActions.length > 0 && (
                        <div className="flex items-center gap-2 mr-2 bg-indigo-50 px-3 py-1.5 rounded-lg">
                            <span className="text-sm font-medium text-indigo-700">{selectedRows.length} selected</span>
                            <div className="h-4 w-px bg-indigo-200 mx-1"></div>
                            {bulkActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => action.onClick(selectedRows)}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Density Toggle */}
                    <button
                        onClick={() => setDensity(d => d === 'normal' ? 'compact' : 'normal')}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Toggle Density"
                    >
                        {density === 'normal' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>

                    {/* Column Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnToggle(!showColumnToggle)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Columns"
                        >
                            <Columns size={18} />
                        </button>

                        {showColumnToggle && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-20 animate-scale-in">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Visible Columns</h4>
                                {columns.map(col => (
                                    <label key={col.key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[col.key]}
                                            onChange={(e) => setVisibleColumns(prev => ({ ...prev, [col.key]: e.target.checked }))}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Export */}
                    {exportable && (
                        <button
                            onClick={() => onExport && onExport()}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 hidden md:table-header-group">
                            <tr>
                                {expandable && <th className="px-6 py-3 w-4"></th>}
                                {selectable && (
                                    <th className="px-6 py-3 w-4">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={displayData.length > 0 && selectedRows.length === displayData.length}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                )}
                                {columns.filter(col => visibleColumns[col.key]).map(col => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable !== false && handleSort(col.key)}
                                        className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            {col.sortable !== false && sortConfig.key === col.key && (
                                                <span className="text-indigo-600">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 block md:table-row-group">
                            {loading ? (
                                [...Array(itemsPerPage)].map((_, idx) => (
                                    <tr key={`skeleton-${idx}`} className="animate-pulse block md:table-row mb-4 md:mb-0 border md:border-none rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0">
                                        {expandable && <td className="px-6 py-4 w-4 hidden md:table-cell"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>}
                                        {selectable && (
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                            </td>
                                        )}
                                        {columns.filter(col => visibleColumns[col.key]).map((col, colIdx) => (
                                            <td key={`skeleton-col-${colIdx}`} className="px-6 py-4 block md:table-cell flex justify-between">
                                                <div className="h-4 bg-gray-200 rounded w-full" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : displayData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="px-6 py-12 text-center text-gray-500 block md:table-cell">
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                displayData.map((row, idx) => (
                                    <React.Fragment key={row.id || idx}>
                                        <tr
                                            className={`hover:bg-gray-50 transition-colors block md:table-row mb-4 md:mb-0 border md:border-none rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 ${selectedRows.includes(row.id) ? 'bg-indigo-50/30' : ''} ${expandedRows.includes(row.id) ? 'bg-gray-50' : ''}`}
                                            onClick={() => expandable && handleExpandRow(row.id)}
                                        >
                                            {expandable && (
                                                <td className="px-6 py-4 w-4 cursor-pointer hidden md:table-cell">
                                                    {expandedRows.includes(row.id) ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-400" />}
                                                </td>
                                            )}
                                            {selectable && (
                                                <td className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'} hidden md:table-cell`} onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(row.id)}
                                                        onChange={() => handleSelectRow(row.id)}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                </td>
                                            )}
                                            {/* Mobile Select/Expand Header */}
                                            <td className="md:hidden pb-2 mb-2 border-b border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {selectable && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.includes(row.id)}
                                                            onChange={(e) => { e.stopPropagation(); handleSelectRow(row.id); }}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    )}
                                                    <span className="font-medium text-gray-900">#{row.id}</span>
                                                </div>
                                                {expandable && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleExpandRow(row.id); }}>
                                                        {expandedRows.includes(row.id) ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-400" />}
                                                    </button>
                                                )}
                                            </td>

                                            {columns.filter(col => visibleColumns[col.key]).map(col => (
                                                <td key={col.key} className={`px-6 ${density === 'compact' ? 'py-2' : 'py-4'} text-sm text-gray-700 block md:table-cell flex justify-between items-center md:block`}>
                                                    <span className="md:hidden font-medium text-gray-500 text-xs uppercase tracking-wider">{col.label}</span>
                                                    <span className="text-right md:text-left">
                                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                        {expandable && expandedRows.includes(row.id) && (
                                            <tr className="bg-gray-50/50 block md:table-row">
                                                <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="px-6 py-4 border-t border-gray-100 shadow-inner block md:table-cell">
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
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || loading}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                // Simple pagination logic for demo - can be improved for large page counts
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
                                            ? 'bg-indigo-600 text-white'
                                            : 'hover:bg-white text-gray-600'
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
                            className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

DataTable.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        sortable: PropTypes.bool,
        render: PropTypes.func
    })).isRequired,
    data: PropTypes.array.isRequired,
    totalItems: PropTypes.number,
    onPageChange: PropTypes.func,
    onSort: PropTypes.func,
    onExport: PropTypes.func,
    onSearch: PropTypes.func,
    onSelectionChange: PropTypes.func,
    bulkActions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired
    })),
    itemsPerPage: PropTypes.number,
    searchable: PropTypes.bool,
    exportable: PropTypes.bool,
    selectable: PropTypes.bool,
    loading: PropTypes.bool,
    expandable: PropTypes.bool,
    renderExpandedRow: PropTypes.func
};
