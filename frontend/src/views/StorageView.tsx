import React from 'react'
import type { Book, Library, Bookshelf, Shelf } from '@/types'
import { MoveBookModal, BookDetailModal } from '@/components/modals'

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

interface StorageViewProps {
  books: Book[]
  libraries: Library[]
  allBookshelves: Bookshelf[]
  allShelves: Shelf[]
  bookToBorrow: Book | null
  bookToMove: Book | null
  detailPopup: { type: string; data: Book } | null
  onSetBookToBorrow: (book: Book | null) => void
  onSetBookToMove: (book: Book | null) => void
  onSetShowBorrowModal: (show: boolean) => void
  onSetShowMoveBookModal: (show: boolean) => void
  onSetDetailPopup: (popup: { type: string; data: Book } | null) => void
  onMoveBook: (bookId: number, shelfId: number) => Promise<void>
  onNavigateBack: () => void
}

export const StorageView: React.FC<StorageViewProps> = ({
  books,
  libraries,
  allBookshelves,
  allShelves,
  bookToBorrow,
  bookToMove,
  detailPopup,
  onSetBookToBorrow,
  onSetBookToMove,
  onSetShowBorrowModal,
  onSetShowMoveBookModal,
  onSetDetailPopup,
  onMoveBook,
  onNavigateBack,
}) => {
  const storageBooks = books.filter(
    (b: Book) => (b.shelf_id === null && b.status === 'storage') || (b.shelf_id === null && !b.status)
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateBack}
                className="text-blue-600 hover:text-blue-700 font-medium"
                title="Go back to dashboard"
              >
                🏠
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              <img src="/box.png" alt="Storage" className="w-8 h-8" /> Storage
            </h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {storageBooks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No books in storage</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storageBooks.map((book: Book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 flex flex-col h-full"
              >
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900">{book.title}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onSetDetailPopup({ type: 'book', data: book })}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View details"
                    >
                      ℹ️
                    </button>
                    <button
                      onClick={() => {
                        onSetBookToBorrow(book)
                        onSetShowBorrowModal(true)
                      }}
                      className="px-2 py-1 hover:bg-green-50 rounded transition-colors"
                      title="Lend book"
                    >
                      <img src="/borrow.png" alt="Lend book" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        onSetBookToMove(book)
                        onSetShowMoveBookModal(true)
                      }}
                      className="px-2 py-1 hover:bg-orange-50 rounded transition-colors"
                      title="Move to shelf"
                    >
                      <img src="/shelf.png" alt="Shelf" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                    <span>{book.author || '-'}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                    <span>{formatDateAsddmmyy(book.year)}</span>
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <p className="text-xs text-gray-700">{book.short_description || ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {detailPopup && detailPopup.type === 'book' && (
        <BookDetailModal book={detailPopup.data as Book} onClose={() => onSetDetailPopup(null)} />
      )}

      <MoveBookModal
        book={bookToMove}
        libraries={libraries}
        allBookshelves={allBookshelves}
        allShelves={allShelves}
        onClose={() => {
          onSetShowMoveBookModal(false)
          onSetBookToMove(null)
        }}
        onMove={onMoveBook}
      />
    </div>
  )
}
