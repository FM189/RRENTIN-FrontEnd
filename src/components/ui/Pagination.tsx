"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function PaginationButton({
  children,
  active = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-[12px] font-bold leading-[18px] transition-colors ${
        active
          ? "bg-[#0245A5] text-white shadow-[0px_-0.86px_8.63px_rgba(0,0,0,0.1)]"
          : disabled
            ? "cursor-not-allowed border border-[#F1F1F1] bg-white text-[#C0C0C0] shadow-[0px_-0.86px_8.63px_rgba(0,0,0,0.1)]"
            : "border border-[#F1F1F1] bg-white text-[#545454] shadow-[0px_-0.86px_8.63px_rgba(0,0,0,0.1)] hover:bg-[#F1F7FF]"
      }`}
    >
      {children}
    </button>
  );
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center gap-2">
      <PaginationButton
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        &laquo;
      </PaginationButton>
      <PaginationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lsaquo;
      </PaginationButton>

      {pages.map((page, i) =>
        page === "..." ? (
          <PaginationButton key={`ellipsis-${i}`}>...</PaginationButton>
        ) : (
          <PaginationButton
            key={page}
            active={page === currentPage}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </PaginationButton>
        ),
      )}

      <PaginationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &rsaquo;
      </PaginationButton>
      <PaginationButton
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        &raquo;
      </PaginationButton>
    </div>
  );
}
