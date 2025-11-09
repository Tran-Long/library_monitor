import React from 'react'
import type { Book, Shelf, Bookshelf, Library } from '@/types'

interface DashboardClickableProps {
  books: Book[]
  shelves: Shelf[]
  selectedBookshelf: Bookshelf | null
  libraries?: Library[]
  onStorageClick: () => void
  onLibraryClick: () => void
  onBorrowedClick: () => void
  onManageBooks: () => void
  onManageUsers: () => void
}

export default function DashboardClickable({
  books,
  shelves: _shelves,
  selectedBookshelf: _selectedBookshelf,
  libraries = [],
  onStorageClick,
  onLibraryClick,
  onBorrowedClick,
  onManageBooks,
  onManageUsers,
}: DashboardClickableProps) {
  const storageBooks = books.filter(b => (b.shelf_id === null && b.status === 'storage') || (b.shelf_id === null && !b.status))
  const libraryBooks = books.filter(b => b.shelf_id !== null)
  const borrowedBooks = books.filter(b => b.status === 'borrowed')

  const StatCard = ({
    title,
    icon,
    color,
    onClick,
    children,
  }: {
    title: string
    icon: string
    color: string
    onClick: () => void
    children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      className={`${color} rounded-lg shadow-md p-6 text-white hover:shadow-lg hover:scale-105 transition transform cursor-pointer text-left`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <span className="text-4xl">{icon}</span>
      </div>
      {children}
      <p className="text-sm opacity-90 mt-4">Click to view</p>
    </button>
  )

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Storage Card */}
        <StatCard
          title="Storage"
          icon="📦"
          color="bg-blue-600 hover:bg-blue-700"
          onClick={onStorageClick}
        >
          <div className="text-5xl font-bold mb-2">{storageBooks.length}</div>
          <p className="text-sm opacity-90">books in storage</p>
        </StatCard>

        {/* Library Card */}
        <StatCard
          title="Library"
          icon="📚"
          color="bg-green-600 hover:bg-green-700"
          onClick={onLibraryClick}
        >
          <div className="space-y-2">
            <div>
              <p className="text-sm opacity-90">Libraries</p>
              <div className="text-3xl font-bold">{libraries.length}</div>
            </div>
            <div>
              <p className="text-sm opacity-90">Books</p>
              <div className="text-3xl font-bold">{libraryBooks.length}</div>
            </div>
          </div>
        </StatCard>

        {/* Borrowed Card */}
        <StatCard
          title="Borrowed"
          icon="✨"
          color="bg-purple-600 hover:bg-purple-700"
          onClick={onBorrowedClick}
        >
          <div className="text-5xl font-bold mb-2">{borrowedBooks.length}</div>
          <p className="text-sm opacity-90">books borrowed</p>
        </StatCard>
      </div>

      {/* Manage Books and Manage Users Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            console.log('Manage Books clicked')
            onManageBooks()
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition shadow-md hover:shadow-lg"
        >
          📚 Manage Books
        </button>
        <button
          onClick={() => {
            console.log('Manage Users clicked')
            onManageUsers()
          }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition shadow-md hover:shadow-lg"
        >
          👥 Manage Users
        </button>
      </div>
    </div>
  )
}
