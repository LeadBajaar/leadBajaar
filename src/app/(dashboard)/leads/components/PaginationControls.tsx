import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationControlsProps {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setItemsPerPage: (items: number) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

export function PaginationControls({
  totalItems,
  currentPage,
  itemsPerPage,
  totalPages,
  setItemsPerPage,
  setCurrentPage
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between px-2 py-2 gap-4 flex-wrap sm:flex-nowrap font-sans">
      <div className="flex items-center gap-4 text-[13px] sm:text-sm text-slate-600 dark:text-slate-400">
        <span className="hidden sm:inline font-normal">
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span>–<span className="font-semibold text-slate-900 dark:text-slate-100">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold font-heading text-slate-900 dark:text-white">{totalItems.toLocaleString()}</span> leads
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 font-normal hidden sm:inline text-[13px]">Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[13px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            {[10, 25, 50, 100].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[13px] sm:text-sm font-medium text-slate-700 dark:text-slate-300 mr-1.5">
          Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages || 1}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost"
            className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-90 p-0"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost"
            className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-90 p-0"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost"
            className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-90 p-0"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost"
            className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-90 p-0"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
