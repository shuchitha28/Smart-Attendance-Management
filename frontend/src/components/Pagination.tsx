import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  colorScheme?: 'amber' | 'purple' | 'cyan' | 'emerald';
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  itemLabel = 'records',
  colorScheme = 'amber',
}) => {
  const { isDark } = useTheme();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push('...');
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
    purple: 'bg-purple-600 text-white shadow-md shadow-purple-600/30',
    cyan: 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30',
    emerald: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
  };

  const btnBase = `w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all`;
  const btnActive = colorClasses[colorScheme] || colorClasses.amber;
  const btnInactive = isDark
    ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-100'
    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900';
  const btnDisabled = isDark
    ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
    : 'bg-gray-50 text-gray-300 border border-gray-200 cursor-not-allowed';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
      <p className={`text-xs ${textMuted}`}>
        Showing <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{startItem}–{endItem}</span> of{' '}
        <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{totalItems}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`} title="First page">
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`} title="Previous page">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className={`w-8 h-8 flex items-center justify-center text-xs ${textMuted}`}>…</span>
          ) : (
            <button key={page} onClick={() => onPageChange(page as number)} className={`${btnBase} ${currentPage === page ? btnActive : btnInactive}`}>
              {page}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`} title="Next page">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`} title="Last page">
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
