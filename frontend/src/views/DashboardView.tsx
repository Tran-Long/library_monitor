import React from 'react'
import DashboardClickable from '@/components/DashboardClickable'
import type { Book, Library, Bookshelf, Shelf } from '@/types'

interface DashboardViewProps {
  books: Book[]
  shelves: Shelf[]
  selectedBookshelf: Bookshelf | null
  libraries: Library[]
  onLibraryClick: () => void
  onBorrowedClick: () => void
  onManageBooks: () => void
  onManageUsers: () => void
  onShowCreateBookModal: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  books,
  shelves,
  selectedBookshelf,
  libraries,
  onLibraryClick,
  onBorrowedClick,
  onManageBooks,
  onManageUsers,
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏛️ Library Monitor</h1>
            <p className="text-gray-600 mt-1">Manage your library collection efficiently</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <DashboardClickable
          books={books}
          shelves={shelves}
          selectedBookshelf={selectedBookshelf}
          libraries={libraries}
          onLibraryClick={onLibraryClick}
          onBorrowedClick={onBorrowedClick}
          onManageBooks={onManageBooks}
          onManageUsers={onManageUsers}
        />
      </main>
    </div>
  )
}
