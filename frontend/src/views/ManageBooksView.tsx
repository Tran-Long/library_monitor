import React, { useState, useEffect } from 'react'
import { Book, Library, Bookshelf, Shelf, User, Borrowing } from '@/types'

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

interface ManageBooksViewProps {
  books: Book[]
  borrowings: Borrowing[]
  users: User[]
  libraries: Library[]
  allBookshelves: Bookshelf[]
  allShelves: Shelf[]
  error: string | null
  isSubmitting: boolean
  bookToBorrow: Book | null
  bookToMove: Book | null
  onBackClick: () => void
  onAddBookClick: () => void
  onEditBook: (book: Book) => void
  onDeleteBook: (bookId: number, shelfId: number | null) => void
  onSetBookToBorrow: (book: Book | null) => void
  onSetBookToMove: (book: Book | null) => void
  onSetShowBorrowModal: (show: boolean) => void
  onSetShowMoveBookModal: (show: boolean) => void
  onMoveToStorage: (bookId: number) => Promise<void>
  onReturnBook: (bookId: number) => Promise<void>
  onShowReturnConfirmation?: (borrowing: Borrowing) => void
  onNavigateToLibrariesView: (libraryId: number) => Promise<void>
  onNavigateToBookshelfView: (libraryId: number, bookshelfId: number) => Promise<void>
  onNavigateToShelfView: (libraryId: number, bookshelfId: number, shelfId: number) => Promise<void>
  onRetry?: () => void
}

export function ManageBooksView({
  books,
  borrowings,
  users,
  libraries,
  allBookshelves,
  allShelves,
  error,
  isSubmitting,
  bookToBorrow,
  bookToMove,
  onBackClick,
  onAddBookClick,
  onEditBook,
  onDeleteBook,
  onSetBookToBorrow,
  onSetBookToMove,
  onSetShowBorrowModal,
  onSetShowMoveBookModal,
  onMoveToStorage,
  onReturnBook,
  onShowReturnConfirmation,
  onNavigateToLibrariesView,
  onNavigateToBookshelfView,
  onNavigateToShelfView,
  onRetry,
}: ManageBooksViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'storage' | 'library' | 'borrowed'>('all')
  const [selectedLibrary, setSelectedLibrary] = useState<number | null>(null)
  const [selectedBookshelf, setSelectedBookshelf] = useState<number | null>(null)
  const [selectedShelf, setSelectedShelf] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [columnsView, setColumnsView] = useState<1 | 2>(1)
  const [libraryPopupBookId, setLibraryPopupBookId] = useState<number | null>(null)
  const [borrowedPopupBookId, setBorrowedPopupBookId] = useState<number | null>(null)

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Check if the click is on a status button (library or borrowed)
      const statusButton = target.closest('[data-status-button]')
      
      if (!statusButton) {
        setLibraryPopupBookId(null)
        setBorrowedPopupBookId(null)
      }
    }

    if (libraryPopupBookId !== null || borrowedPopupBookId !== null) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [libraryPopupBookId, borrowedPopupBookId])

  const getStatusBadge = (book: Book) => {
    // Determine if book is actually borrowed by checking borrowed_by_user_id (more reliable than status field)
    const isBorrowed = book.borrowed_by_user_id !== null && book.borrowed_by_user_id !== undefined
    
    if (book.status === 'storage') {
      return { label: 'Storage', color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: '/box.png', iconAlt: 'Storage' }
    }
    if (isBorrowed || book.status === 'borrowed') {
      return { label: 'Borrowed', color: 'bg-purple-50 text-purple-700 border border-purple-200', icon: '/borrow.png', iconAlt: 'Borrowed' }
    }
    return { label: 'Library', color: 'bg-green-50 text-green-700 border border-green-200', icon: '/library.png', iconAlt: 'Library' }           
  }

  // Get available bookshelves for selected library
  const availableBookshelves = selectedLibrary
    ? allBookshelves.filter(bs => bs.library_id === selectedLibrary)
    : []

  // Get available shelves for selected bookshelf
  const availableShelves = selectedBookshelf
    ? allShelves.filter(s => s.bookshelf_id === selectedBookshelf)
    : []

  // Filter books based on search term and status filter
  const filteredBooks = books.filter((book) => {
    // Helper function to determine if a book is actually borrowed (more reliable than status field)
    const isBorrowed = book.borrowed_by_user_id !== null && book.borrowed_by_user_id !== undefined
    
    // Status filter - for borrowed, check borrowed_by_user_id instead of status field
    if (statusFilter !== 'all') {
      if (statusFilter === 'borrowed' && !isBorrowed) {
        return false
      }
      if (statusFilter !== 'borrowed' && book.status !== statusFilter) {
        return false
      }
    }

    // Library location filter (only for library books)
    if (statusFilter === 'library' || (statusFilter === 'all' && book.status === 'library')) {
      if (selectedLibrary || selectedBookshelf || selectedShelf) {
        const shelf = allShelves.find(s => s.id === book.shelf_id)
        const bookshelf = shelf ? allBookshelves.find(bs => bs.id === shelf.bookshelf_id) : null
        
        if (selectedShelf && book.shelf_id !== selectedShelf) {
          return false
        }
        if (selectedBookshelf && shelf?.bookshelf_id !== selectedBookshelf) {
          return false
        }
        if (selectedLibrary && bookshelf?.library_id !== selectedLibrary) {
          return false
        }
      }
    }

    // User filter (only for borrowed books)
    if (statusFilter === 'borrowed' || (statusFilter === 'all' && book.status === 'borrowed')) {
      if (selectedUser && book.borrowed_by_user_id !== selectedUser) {
        return false
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      return (
        book.title.toLowerCase().includes(searchLower) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.year && formatDateAsddmmyy(book.year).toLowerCase().includes(searchLower)) ||
        (book.short_description && book.short_description.toLowerCase().includes(searchLower)) ||
        (book.long_description && book.long_description.toLowerCase().includes(searchLower))
      )
    }

    return true
  }).sort((a, b) => {
    let compareResult = 0

    if (sortBy === 'name') {
      compareResult = a.title.localeCompare(b.title)
    } else if (sortBy === 'date') {
      // Sort by publication date (year field is now a date string YYYY-MM-DD)
      // Treat null dates as the oldest (earliest) by using a very old timestamp
      const dateA = a.year ? new Date(a.year).getTime() : -Infinity
      const dateB = b.year ? new Date(b.year).getTime() : -Infinity
      compareResult = dateA - dateB
    }

    return sortOrder === 'asc' ? compareResult : -compareResult
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackClick}
                className="text-blue-600 hover:text-blue-700 font-medium"
                title="Go back to dashboard"
              >
                🏠
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              📚 Manage Books
            </h1>
            <div>
              <button
                onClick={onAddBookClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Add New Book
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-red-700">
                <strong>Error:</strong> {error}
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition"
                  title="Try to load data again"
                >
                  🔄 Retry
                </button>
              )}
            </div>
          </div>
        )}

        {error && books.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">Failed to load books. The backend server might be unavailable.</p>
            <p className="text-gray-500 text-sm mb-6">Please check your connection and try again.</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
              >
                🔄 Retry Loading Books
              </button>
            )}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No books yet. Add one to get started!</p>
            <button
              onClick={onAddBookClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
            >
              ➕ Add First Book
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compact Search, Filter, and Sort Section */}
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              {/* Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search books by title, author, year..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Status and Sort Controls */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* Status Filter Buttons */}
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => {
                      setStatusFilter('all')
                      setSelectedLibrary(null)
                      setSelectedBookshelf(null)
                      setSelectedShelf(null)
                      setSelectedUser(null)
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      statusFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('storage')
                      setSelectedLibrary(null)
                      setSelectedBookshelf(null)
                      setSelectedShelf(null)
                      setSelectedUser(null)
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      statusFilter === 'storage'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <img src="/box.png" alt="Storage" className="w-4 h-4 inline-block mr-1" />
                    Storage
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('library')
                      setSelectedLibrary(null)
                      setSelectedBookshelf(null)
                      setSelectedShelf(null)
                      setSelectedUser(null)
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      statusFilter === 'library'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <img src="/library.png" alt="Library" className="w-4 h-4 inline-block mr-1" />
                    Library
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('borrowed')
                      setSelectedLibrary(null)
                      setSelectedBookshelf(null)
                      setSelectedShelf(null)
                      setSelectedUser(null)
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      statusFilter === 'borrowed'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <img src="/borrow.png" alt="Borrowed" className="w-4 h-4 inline-block mr-1" />
                    Borrowed
                  </button>
                </div>

                {/* Sort Controls */}
                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => {
                      setSortBy('name')
                      setSortOrder('asc')
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      sortBy === 'name' && sortOrder === 'asc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Sort by name A-Z"
                  >
                    A-Z
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('name')
                      setSortOrder('desc')
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      sortBy === 'name' && sortOrder === 'desc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Sort by name Z-A"
                  >
                    Z-A
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('date')
                      setSortOrder('desc')
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                      sortBy === 'date' && sortOrder === 'desc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Newest first"
                  >
                    <img src="/thirty-one-date.png" alt="Newest" className="w-4 h-4" /> Newest
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('date')
                      setSortOrder('asc')
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                      sortBy === 'date' && sortOrder === 'asc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Oldest first"
                  >
                    <img src="/number-1-date.png" alt="Oldest" className="w-4 h-4" /> Oldest
                  </button>
                </div>
              </div>

              {/* Library/Bookshelf/Shelf Filter (only for Library status) */}
              {statusFilter === 'library' && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <select
                    value={selectedLibrary || ''}
                    onChange={(e) => {
                      setSelectedLibrary(e.target.value ? parseInt(e.target.value) : null)
                      setSelectedBookshelf(null)
                      setSelectedShelf(null)
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Libraries</option>
                    {libraries.map((lib) => (
                      <option key={lib.id} value={lib.id}>
                        {lib.name}
                      </option>
                    ))}
                  </select>

                  {selectedLibrary && (
                    <select
                      value={selectedBookshelf || ''}
                      onChange={(e) => {
                        setSelectedBookshelf(e.target.value ? parseInt(e.target.value) : null)
                        setSelectedShelf(null)
                      }}
                      className="px-3 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Bookshelves</option>
                      {availableBookshelves.map((bs) => (
                        <option key={bs.id} value={bs.id}>
                          {bs.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {selectedBookshelf && (
                    <select
                      value={selectedShelf || ''}
                      onChange={(e) => {
                        setSelectedShelf(e.target.value ? parseInt(e.target.value) : null)
                      }}
                      className="px-3 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Shelves</option>
                      {availableShelves.map((shelf) => (
                        <option key={shelf.id} value={shelf.id}>
                          #{shelf.order} {shelf.name ? `: ${shelf.name}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* User Filter (only for Borrowed status) */}
              {statusFilter === 'borrowed' && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <select
                    value={selectedUser || ''}
                    onChange={(e) => {
                      setSelectedUser(e.target.value ? parseInt(e.target.value) : null)
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Users</option>
                    {books
                      .filter(b => b.status === 'borrowed' && b.borrowed_by_user_name)
                      .reduce((unique: Array<{ id: number; name: string }>, book) => {
                        if (!unique.find(u => u.id === book.borrowed_by_user_id)) {
                          unique.push({ id: book.borrowed_by_user_id!, name: book.borrowed_by_user_name! })
                        }
                        return unique
                      }, [])
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}              {/* Results Count */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-gray-500">
                  {filteredBooks.length} of {books.length} books
                </span>
                {/* Layout toggle buttons */}
                <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded">
                  <button
                    onClick={() => setColumnsView(1)}
                    className={`p-1.5 rounded transition-all ${
                      columnsView === 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="1 column layout"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                      <path d="M3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                      <path d="M3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setColumnsView(2)}
                    className={`p-1.5 rounded transition-all ${
                      columnsView === 2
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="2 column layout"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="2" y="3" width="7" height="6" />
                      <rect x="11" y="3" width="7" height="6" />
                      <rect x="2" y="11" width="7" height="6" />
                      <rect x="11" y="11" width="7" height="6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Books List */}
            {filteredBooks.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No books match your search or filter criteria.</p>
              </div>
            ) : (
              <div className={columnsView === 2 ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
                {filteredBooks.map((book) => {
                  const status = getStatusBadge(book)
                  return (
                    <div
                      key={book.id}
                      className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400 hover:shadow-lg transition"
                    >
                      <div className="flex items-start gap-4">
                        {/* Book Information */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-lg text-gray-900">{book.title}</p>
                            {/* All controls in one line: status-dependent icons | status text | edit/delete icons */}
                            <div className="flex items-center gap-3 ml-4">
                              {/* Status-dependent action buttons */}
                              <div className="flex gap-1">
                                {book.status === 'library' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        onSetBookToBorrow(book)
                                        onSetShowBorrowModal(true)
                                      }}
                                      className="p-1 hover:bg-green-50 rounded transition-colors"
                                      title="Lend book"
                                    >
                                      <img src="/borrow.png" alt="Lend book" className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Are you sure you want to move "${book.title}" to storage?`)) {
                                          onMoveToStorage(book.id)
                                        }
                                      }}
                                      className="p-1 hover:bg-orange-50 rounded transition-colors"
                                      title="Move to storage"
                                    >
                                      <img src="/box.png" alt="Move to storage" className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                                {book.status === 'storage' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        onSetBookToBorrow(book)
                                        onSetShowBorrowModal(true)
                                      }}
                                      className="p-1 hover:bg-green-50 rounded transition-colors"
                                      title="Lend book"
                                    >
                                      <img src="/borrow.png" alt="Lend book" className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        onSetBookToMove(book)
                                        onSetShowMoveBookModal(true)
                                      }}
                                      className="p-1 hover:bg-orange-50 rounded transition-colors"
                                      title="Move to shelf"
                                    >
                                      <img src="/shelf.png" alt="Move to shelf" className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                                {book.status === 'borrowed' && (
                                  <button
                                    onClick={() => {
                                      const borrowing = borrowings.find(b => b.book_id === book.id && b.return_date === null)
                                      if (borrowing && onShowReturnConfirmation) {
                                        onShowReturnConfirmation(borrowing)
                                      } else if (window.confirm(`Are you sure you want to return "${book.title}" to storage?`)) {
                                        onReturnBook(book.id)
                                      }
                                    }}
                                    className="p-1 hover:bg-blue-50 rounded transition-colors"
                                    title="Return book to storage"
                                  >
                                    <img src="/return_book.png" alt="Return to storage" className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                              {/* Status text */}
                              {book.status === 'library' ? (
                                <div className="relative">
                                  <button
                                    onClick={() => setLibraryPopupBookId(libraryPopupBookId === book.id ? null : book.id)}
                                    className={`px-2 py-1 text-sm font-medium whitespace-nowrap rounded cursor-pointer hover:opacity-80 transition-opacity ${status.color}`}
                                    data-status-button
                                  >
                                    {status.label}
                                  </button>
                                  {/* Library Info Popup */}
                                  {libraryPopupBookId === book.id && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-max z-50 pointer-events-auto">
                                      {(() => {
                                        const shelf = allShelves.find(s => s.id === book.shelf_id)
                                        const bookshelf = shelf ? allBookshelves.find(bs => bs.id === shelf.bookshelf_id) : null
                                        const library = bookshelf ? libraries.find(lib => lib.id === bookshelf.library_id) : null

                                        return (
                                          <div className="space-y-2 text-sm">
                                            {library && (
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation()
                                                  await onNavigateToLibrariesView(library.id)
                                                  setLibraryPopupBookId(null)
                                                }}
                                                className="block w-full text-left px-2 py-1 hover:bg-blue-50 rounded text-blue-600 font-medium transition-colors flex items-center gap-2"
                                              >
                                                <img src="/library.png" alt="Library" className="w-4 h-4" />
                                                {library.name}
                                              </button>
                                            )}
                                            {bookshelf && (
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation()
                                                  await onNavigateToBookshelfView(bookshelf.library_id, bookshelf.id)
                                                  setLibraryPopupBookId(null)
                                                }}
                                                className="block w-full text-left px-2 py-1 hover:bg-green-50 rounded text-green-600 font-medium transition-colors flex items-center gap-2"
                                              >
                                                <img src="/bookshelf.png" alt="Bookshelf" className="w-4 h-4" />
                                                {bookshelf.name}
                                              </button>
                                            )}
                                            {shelf && (
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation()
                                                  await onNavigateToShelfView(bookshelf?.library_id || 0, bookshelf?.id || 0, shelf.id)
                                                  setLibraryPopupBookId(null)
                                                }}
                                                className="block w-full text-left px-2 py-1 hover:bg-amber-50 rounded text-amber-600 font-medium transition-colors flex items-center gap-2"
                                              >
                                                <img src="/shelf.png" alt="Shelf" className="w-4 h-4" />
                                                #{shelf.order}
                                              </button>
                                            )}
                                          </div>
                                        )
                                      })()}
                                    </div>
                                  )}
                                </div>
                              ) : book.status === 'borrowed' ? (
                                <div className="relative">
                                  <button
                                    onClick={() => setBorrowedPopupBookId(borrowedPopupBookId === book.id ? null : book.id)}
                                    className={`px-2 py-1 text-sm font-medium whitespace-nowrap rounded cursor-pointer hover:opacity-80 transition-opacity ${status.color}`}
                                    data-status-button
                                  >
                                    {status.label}
                                  </button>
                                  {/* Borrowed Info Popup */}
                                  {borrowedPopupBookId === book.id && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-max z-50 pointer-events-auto">
                                      {book.borrowed_by_user_name ? (
                                        <div className="text-sm">
                                          <p className="text-gray-600 font-medium">Borrowed by:</p>
                                          <p className="text-purple-600 font-semibold flex items-center gap-2 mt-1">
                                            <img src="/user.png" alt="User" className="w-4 h-4" />
                                            {book.borrowed_by_user_name}
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-500">No user information</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className={`px-2 py-1 text-sm font-medium whitespace-nowrap rounded ${status.color}`}>
                                  {status.label}
                                </span>
                              )}
                              {/* Common action buttons */}
                              <div className="flex gap-2 ml-2">
                                <button
                                  onClick={() => onEditBook(book)}
                                  className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit book"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => onDeleteBook(book.id, book.shelf_id || null)}
                                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete book"
                                >
                                  <img src="/trash.png" alt="Delete book" className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 mb-2">
                            <div className="w-1/5">
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                                <span>{book.author || '-'}</span>
                              </p>
                            </div>
                            <div className="w-1/5">
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                                <span>{formatDateAsddmmyy(book.year)}</span>
                              </p>
                            </div>
                          </div>

                          {book.short_description && (
                            <p className="text-sm text-gray-700 border-t border-gray-200 pt-2">
                              {book.short_description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
