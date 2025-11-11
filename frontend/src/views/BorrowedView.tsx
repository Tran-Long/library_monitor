import React from 'react'
import type { Book, User } from '@/types'

interface BorrowedViewProps {
  books: Book[]
  users: User[]
  onBackClick: () => void
}

export const BorrowedView: React.FC<BorrowedViewProps> = ({ books, users, onBackClick }) => {
  const borrowedBooks = books.filter(b => b.status === 'borrowed')

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBackClick} className="text-blue-600 hover:text-blue-700 font-medium" title="Go back to dashboard">
            🏠
          </button>
          <h1 className="text-3xl font-bold text-gray-900">✨ Borrowed</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {borrowedBooks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No borrowed books</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {borrowedBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <p className="font-semibold text-gray-800">{book.title}</p>
                {book.author && <p className="text-sm text-gray-600">{book.author}</p>}
                {book.year && <p className="text-sm text-gray-500">{book.year}</p>}
                {book.short_description && <p className="text-xs text-gray-600 mt-2">{book.short_description}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
