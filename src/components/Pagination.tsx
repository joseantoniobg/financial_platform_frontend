import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationInfo } from './PaginationInfo';

function Pagination({ totalPages, currentPage, setPage, totalRecords }: { totalPages?: number; currentPage: number; setPage: (page: any) => void; totalRecords?: number }) {

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    totalPages = totalPages || 1;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const onPageChange = (page: number) => {
      setPage((curr: Object) => ({ ...curr, page }));
  }

  return (
    <div>
      <PaginationInfo props={{ totalPages, page: currentPage, totalRecords }} />
      <div className="flex items-center justify-center gap-2 flex-wrap mt-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-[hsl(var(--app-border))] hover:bg-[hsl(var(--card))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Primeira Página"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-[hsl(var(--app-border))] hover:bg-[hsl(var(--card))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Página Anterior"
        >
          <ChevronLeft size={18} />
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(+page)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                currentPage === +page
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--nav-foreground))] border-[hsl(var(--app-border))]'
                  : 'border-[hsl(var(--primary))] hover:bg-[hsl(var(--card))]'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-[hsl(var(--app-border))] hover:bg-[hsl(var(--card))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Próxima Página"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => onPageChange(totalPages || 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-[hsl(var(--app-border))] hover:bg-[hsl(var(--card))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Última Página"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;