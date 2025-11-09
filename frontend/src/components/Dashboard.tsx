import React, { useState, useEffect } from 'react'
import type { Book, Shelf, Bookshelf } from '@/types'

interface DashboardProps {
  books: Book[]
  shelves: Shelf[]
  selectedBookshelf: Bookshelf | null
  onSelectShelf?: (shelf: Shelf) => void
}

export default function Dashboard({ books, shelves, selectedBookshelf, onSelectShelf }: DashboardProps) {
  const [stats, setStats] = useState({ storage: 0, library: 0, borrowed: 0, total: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [books, selectedBookshelf])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/books/stats/')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to load statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  const storageBooks = books.filter(b => (b.shelf_id === null && b.status === 'storage') || (b.shelf_id === null && !b.status))
  const libraryBooks = books.filter(b => (b.shelf_id !== null && b.status === 'library') || (b.shelf_id !== null && !b.status))
  const borrowedBooks = books.filter(b => b.status === 'borrowed')

  const StatCard = ({ title, count, icon, color, books: cardBooks }: any) => (
    <div className={`${color} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-4xl">{icon}</span>
      </div>
      <div className="text-4xl font-bold mb-4">{count}</div>
      <p className="text-sm opacity-90 mb-4">
        {count === 1 ? 'item' : 'items'}
      </p>
      {cardBooks.length > 0 && (
        <div className="mt-4 max-h-48 overflow-y-auto bg-black bg-opacity-20 rounded p-3 space-y-2">
          {cardBooks.slice(0, 5).map((book: Book) => (
            <div key={book.id} className="text-xs border-b border-white border-opacity-30 pb-2">
              <p className="font-semibold truncate">{book.title}</p>
              {book.author && <p className="opacity-75 truncate">{book.author}</p>}
            </div>
          ))}
          {cardBooks.length > 5 && (
            <p className="text-xs opacity-75 pt-2">+{cardBooks.length - 5} more...</p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Library Dashboard</h1>
          <p className="text-gray-600">Overview of your book collection</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Storage"
            count={storageBooks.length}
            icon="📦"
            color="bg-blue-600"
            books={storageBooks}
          />
          <StatCard
            title="Library"
            count={libraryBooks.length}
            icon="📚"
            color="bg-green-600"
            books={libraryBooks}
          />
          <StatCard
            title="Borrowed"
            count={borrowedBooks.length}
            icon="✨"
            color="bg-purple-600"
            books={borrowedBooks}
          />
        </div>

        {/* Detailed View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Storage Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">📦 Storage</h2>
            <p className="text-gray-600 text-sm mb-4">Books not yet placed on shelves</p>
            {storageBooks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No books in storage</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {storageBooks.map((book) => (
                  <div key={book.id} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="font-semibold text-gray-800 truncate">{book.title}</p>
                    {book.author && <p className="text-sm text-gray-600 truncate">{book.author}</p>}
                    {book.year && <p className="text-xs text-gray-500">{book.year}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Library Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4">📚 Library</h2>
            <p className="text-gray-600 text-sm mb-4">Books on shelves</p>
            {libraryBooks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No books on shelves</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {libraryBooks.map((book) => (
                  <div key={book.id} className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                    <p className="font-semibold text-gray-800 truncate">{book.title}</p>
                    {book.author && <p className="text-sm text-gray-600 truncate">{book.author}</p>}
                    {book.year && <p className="text-xs text-gray-500">{book.year}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Borrowed Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">✨ Borrowed</h2>
            <p className="text-gray-600 text-sm mb-4">Books borrowed by others</p>
            {borrowedBooks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No books borrowed</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {borrowedBooks.map((book) => (
                  <div key={book.id} className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                    <p className="font-semibold text-gray-800 truncate">{book.title}</p>
                    {book.author && <p className="text-sm text-gray-600 truncate">{book.author}</p>}
                    {book.year && <p className="text-xs text-gray-500">{book.year}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Total Books</p>
              <p className="text-3xl font-bold text-gray-900">{books.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Shelves</p>
              <p className="text-3xl font-bold text-gray-900">{shelves.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Books per Shelf</p>
              <p className="text-3xl font-bold text-gray-900">
                {shelves.length > 0 ? Math.round(libraryBooks.length / shelves.length) : 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Collection %</p>
              <p className="text-3xl font-bold text-gray-900">
                {books.length > 0 ? Math.round((libraryBooks.length / books.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
