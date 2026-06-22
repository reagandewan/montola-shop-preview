"use client";

import { ReactNode, useState } from "react";
import { HiChevronUp, HiChevronDown, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import LoadingSpinner from "../LoadingSpinner";

export interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        pageSize: number;
        onPageChange: (page: number) => void;
    };
    loading?: boolean;
    emptyMessage?: string;
}

export default function DataTable<T>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    pagination,
    loading = false,
    emptyMessage = "No data available",
}: DataTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: "asc" | "desc";
    } | null>(null);

    const handleSort = (key: string) => {
        const column = columns.find((col) => col.key === key);
        if (!column?.sortable) return;

        setSortConfig((prev) => {
            if (prev?.key === key) {
                return {
                    key,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                };
            }
            return { key, direction: "asc" };
        });
    };

    const sortedData = [...data];
    if (sortConfig) {
        sortedData.sort((a, b) => {
            const aValue = (a as any)[sortConfig.key];
            const bValue = (b as any)[sortConfig.key];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortConfig.direction === "asc" ? comparison : -comparison;
        });
    }

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        const column = columns.find((col) => col.key === columnKey);
        if (!column?.sortable) return null;

        if (sortConfig?.key === columnKey) {
            return sortConfig.direction === "asc" ? (
                <HiChevronUp className="w-4 h-4 inline-block ml-1" />
            ) : (
                <HiChevronDown className="w-4 h-4 inline-block ml-1" />
            );
        }
        return (
            <span className="inline-block ml-1 text-gray-400">
                <HiChevronUp className="w-4 h-4" />
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-12">
                <LoadingSpinner label="Organizing data..." />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => handleSort(column.key)}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable
                                        ? "cursor-pointer hover:bg-gray-100 select-none"
                                        : ""
                                        }`}
                                >
                                    <span className="flex items-center">
                                        {column.header}
                                        <SortIcon columnKey={column.key} />
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick?.(item)}
                                    className={`${onRowClick
                                        ? "cursor-pointer hover:bg-gray-50 transition-colors"
                                        : ""
                                        }`}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : (item as any)[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() =>
                                pagination.onPageChange(
                                    pagination.currentPage - 1
                                )
                            }
                            disabled={pagination.currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous page"
                        >
                            <HiChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-gray-700">
                            {pagination.currentPage}
                        </span>
                        <button
                            onClick={() =>
                                pagination.onPageChange(
                                    pagination.currentPage + 1
                                )
                            }
                            disabled={
                                pagination.currentPage === pagination.totalPages
                            }
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next page"
                        >
                            <HiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
