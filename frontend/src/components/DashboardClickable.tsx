import React, { useState, useEffect } from 'react'
import type { Book, Shelf, Bookshelf, Library, Borrowing } from '@/types'
import { borrowingService } from '@/services/api'

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
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])

  useEffect(() => {
    loadBorrowings()
  }, [books])

  const loadBorrowings = async () => {
    try {
      const response = await borrowingService.getAll()
      setBorrowings(response.data)
    } catch (err) {
      console.error('Failed to load borrowings:', err)
    }
  }

  const storageBooks = books.filter(b => (b.shelf_id === null && b.status === 'storage') || (b.shelf_id === null && !b.status))
  const libraryBooks = books.filter(b => b.shelf_id !== null && b.status !== 'borrowed')
  
  // Get active borrowings
  const currentBorrowings = borrowings.filter(b => !b.return_date)

  const StatCard = ({
    title,
    icon,
    color,
    onClick,
    children,
  }: {
    title: string
    icon?: string
    color: string
    onClick: () => void
    children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      className={`${color} rounded-lg shadow-md p-6 text-white hover:shadow-lg hover:scale-105 transition transform cursor-pointer text-left`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        {icon && <span className="text-3xl flex-shrink-0">{icon}</span>}
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
        <button
          onClick={onStorageClick}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md p-6 text-white hover:shadow-lg hover:scale-105 transition transform cursor-pointer text-left"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-2xl font-bold">Storage</h3>
            <img src="/box.png" alt="Storage" className="w-12 h-12 flex-shrink-0" />
          </div>
          <div className="text-5xl font-bold mb-2">{storageBooks.length}</div>
          <p className="text-sm opacity-90">books in storage</p>
          <p className="text-sm opacity-90 mt-4">Click to view</p>
        </button>

        {/* Library Card */}
        <button
          onClick={onLibraryClick}
          className="bg-green-600 hover:bg-green-700 rounded-lg shadow-md p-6 text-white hover:shadow-lg hover:scale-105 transition transform cursor-pointer text-left"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-2xl font-bold">Library</h3>
            <img src="/library.png" alt="Library" className="w-12 h-12 flex-shrink-0" />
          </div>
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
          <p className="text-sm opacity-90 mt-4">Click to view</p>
        </button>

        {/* Borrowed Card */}
        <button
          onClick={onBorrowedClick}
          className="bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md p-6 text-white hover:shadow-lg hover:scale-105 transition transform cursor-pointer text-left"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-2xl font-bold">Borrowing Sessions</h3>
            <img src="/borrow.png" alt="Borrowed" className="w-12 h-12 flex-shrink-0" />
          </div>
          <div className="text-5xl font-bold mb-2">{currentBorrowings.length}</div>
          <p className="text-sm opacity-90">books currently borrowing</p>
          <p className="text-sm opacity-90 mt-4">Click to view</p>
        </button>
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
          <img src="/group.png" alt="Manage Users" className="w-5 h-5" />
          Manage Users
        </button>
      </div>
    </div>
  )
}
