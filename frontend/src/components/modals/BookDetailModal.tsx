import React from 'react'
import type { Book } from '@/types'

/**
 * Format a date string (YYYY-MM-DD) as dd/mm/yyyy
 */
function formatDateAsddmmyy(dateValue: string | null | undefined): string {
  if (dateValue === null || dateValue === undefined || dateValue === '') return '-'
  
  // Parse ISO date string (YYYY-MM-DD) manually to avoid timezone issues
  const parts = dateValue.split('T')[0].split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    const date = new Date(year, month, day)
    
    if (isNaN(date.getTime())) return '-'
    
    const dayStr = String(date.getDate()).padStart(2, '0')
    const monthStr = String(date.getMonth() + 1).padStart(2, '0')
    const yearStr = String(date.getFullYear())
    
    return `${dayStr}/${monthStr}/${yearStr}`
  }
  
  return '-'
}

interface BookDetailModalProps {
  book: Book | null
  onClose: () => void
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  if (!book) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Anchored Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white flex justify-between items-center flex-shrink-0 z-10">
          <h2 className="text-2xl font-bold">📚 Book Details</h2>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded transition-colors text-2xl">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Title</h3>
            <p className="text-gray-600 mt-2 text-base">{book.title || '-'}</p>
          </div>

          {/* Author */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Author</h3>
            <p className="text-gray-600 mt-2 text-base">{book.author || '-'}</p>
          </div>

          {/* Year */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Year</h3>
            <p className="text-gray-600 mt-2 text-base">{formatDateAsddmmyy(book.year)}</p>
          </div>

          {/* Short Description */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Short Description</h3>
            <p className="text-gray-600 mt-2 text-base">{book.short_description || '-'}</p>
          </div>

          {/* Long Description */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Long Description</h3>
            <p className="text-gray-600 mt-2 text-base whitespace-pre-wrap">{book.long_description || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetailModal
