import React, { useState, useEffect } from 'react'
import { Book, Library, Bookshelf, Shelf, User, Borrowing } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const [dateFilterType, setDateFilterType] = useState<'none' | 'date_month_year' | 'month_year' | 'quarter_year' | 'year'>('none')
  const [dateFilterFrom, setDateFilterFrom] = useState<string>('')
  const [dateFilterTo, setDateFilterTo] = useState<string>('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const { t } = useLanguage()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isDropdownButton = target.closest('[data-dropdown-button]')
      const isDropdownContent = target.closest('[data-dropdown-content]')
      
      if (!isDropdownButton && !isDropdownContent) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [openDropdown])

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
      return { label: t('manageBooksStatusStorage'), color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: '/box.png', iconAlt: t('storage') }
    }
    if (isBorrowed || book.status === 'borrowed') {
      return { label: t('manageBooksStatusBorrowing'), color: 'bg-purple-50 text-purple-700 border border-purple-200', icon: '/borrow.png', iconAlt: t('borrowed') }
    }
    return { label: t('manageBooksStatusLibrary'), color: 'bg-green-50 text-green-700 border border-green-200', icon: '/library.png', iconAlt: t('library') }           
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

    // Date filter based on selected filter type
    if (dateFilterType !== 'none') {
      // Only show books with matching date format
      if (book.date_format !== dateFilterType) return false
      
      if (book.year) {
        const bookDate = new Date(book.year)
        const bookYear = bookDate.getFullYear()
        const bookMonth = bookDate.getMonth() + 1
        const bookDay = bookDate.getDate()
        
        if (dateFilterType === 'date_month_year') {
          // Filter by full date range
          if (dateFilterFrom) {
            const fromDate = new Date(dateFilterFrom)
            if (bookDate < fromDate) return false
          }
          if (dateFilterTo) {
            const toDate = new Date(dateFilterTo)
            if (bookDate > toDate) return false
          }
        } else if (dateFilterType === 'month_year') {
          // Filter by month and year
          if (dateFilterFrom) {
            const [fromYear, fromMonth] = dateFilterFrom.split('-').map(Number)
            if (bookYear < fromYear || (bookYear === fromYear && bookMonth < fromMonth)) return false
          }
          if (dateFilterTo) {
            const [toYear, toMonth] = dateFilterTo.split('-').map(Number)
            if (bookYear > toYear || (bookYear === toYear && bookMonth > toMonth)) return false
          }
        } else if (dateFilterType === 'quarter_year') {
          // Filter by quarter and year
          const getQuarter = (month: number) => Math.ceil(month / 3)
          const bookQuarter = getQuarter(bookMonth)
          
          if (dateFilterFrom) {
            const [fromYear, fromQuarter] = dateFilterFrom.split('-Q').map(Number)
            if (bookYear < fromYear || (bookYear === fromYear && bookQuarter < fromQuarter)) return false
          }
          if (dateFilterTo) {
            const [toYear, toQuarter] = dateFilterTo.split('-Q').map(Number)
            if (bookYear > toYear || (bookYear === toYear && bookQuarter > toQuarter)) return false
          }
        } else if (dateFilterType === 'year') {
          // Filter by year only
          if (dateFilterFrom) {
            const fromYear = parseInt(dateFilterFrom, 10)
            if (bookYear < fromYear) return false
          }
          if (dateFilterTo) {
            const toYear = parseInt(dateFilterTo, 10)
            if (bookYear > toYear) return false
          }
        }
      }
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
                title={useLanguage().t('goBackToDashboard')}
              >
                🏠
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              📚 {t('manageBooksTitle')}
            </h1>
            <div>
              <button
                onClick={onAddBookClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ {t('addBook')}
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
                <strong>{t('error')}:</strong> {error}
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition"
                  title={t('error')}
                >
                  🔄 {t('retry')}
                </button>
              )}
            </div>
          </div>
        )}

        {error && books.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">{t('failedToLoadBooks')}</p>
            <p className="text-gray-500 text-sm mb-6">{t('checkConnectionRetry')}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
              >
                🔄 {t('retryLoadingBooks')}
              </button>
            )}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">{t('noBooksYet')}</p>
            <button
              onClick={onAddBookClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
            >
              ➕ {t('addFirstBook')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search, Filter, and Sort Section */}
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              {/* Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('searchBooksPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Filter Dropdowns and Sort Controls */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* Status Filter Dropdown */}
                <div className="relative">
                  <button
                    data-dropdown-button="status"
                    onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                    className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  >
                    {t('manageBooksFilterStatus')} ▼
                  </button>
                  {openDropdown === 'status' && (
                    <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-40">
                      <button
                        onClick={() => {
                          setStatusFilter('all')
                          setSelectedLibrary(null)
                          setSelectedBookshelf(null)
                          setSelectedShelf(null)
                          setSelectedUser(null)
                          setOpenDropdown(null)
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition ${statusFilter === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                      >
                        {t('all')}
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter('storage')
                          setSelectedLibrary(null)
                          setSelectedBookshelf(null)
                          setSelectedShelf(null)
                          setSelectedUser(null)
                          setOpenDropdown(null)
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition ${statusFilter === 'storage' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                      >
                        <img src="/box.png" alt="Storage" className="w-4 h-4 inline-block mr-2" />
                        {t('manageBooksStatusStorage')}
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter('library')
                          setSelectedLibrary(null)
                          setSelectedBookshelf(null)
                          setSelectedShelf(null)
                          setSelectedUser(null)
                          setOpenDropdown(null)
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition ${statusFilter === 'library' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                      >
                        <img src="/library.png" alt="Library" className="w-4 h-4 inline-block mr-2" />
                        {t('manageBooksStatusLibrary')}
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter('borrowed')
                          setSelectedLibrary(null)
                          setSelectedBookshelf(null)
                          setSelectedShelf(null)
                          setSelectedUser(null)
                          setOpenDropdown(null)
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition ${statusFilter === 'borrowed' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                      >
                        <img src="/borrow.png" alt="Borrowed" className="w-4 h-4 inline-block mr-2" />
                        {t('manageBooksStatusBorrowing')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Library Filter Dropdown (only for Library status) */}
                {statusFilter === 'library' && (
                  <div className="relative">
                    <button
                      data-dropdown-button="library"
                      onClick={() => setOpenDropdown(openDropdown === 'library' ? null : 'library')}
                      className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      🏛️ {t('library')} ▼
                    </button>
                    {openDropdown === 'library' && (
                      <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-48 overflow-y-auto min-w-40">
                        <button
                          onClick={() => {
                            setSelectedLibrary(null)
                            setSelectedBookshelf(null)
                            setSelectedShelf(null)
                            setOpenDropdown(null)
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${selectedLibrary === null ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {t('allLibrariesFilter')}
                        </button>
                        {libraries.map((lib) => (
                          <button
                            key={lib.id}
                            onClick={() => {
                              setSelectedLibrary(lib.id)
                              setSelectedBookshelf(null)
                              setSelectedShelf(null)
                              setOpenDropdown(null)
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm transition ${selectedLibrary === lib.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                          >
                            {lib.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bookshelf Filter Dropdown */}
                {statusFilter === 'library' && selectedLibrary && (
                  <div className="relative">
                    <button
                      data-dropdown-button="bookshelf"
                      onClick={() => setOpenDropdown(openDropdown === 'bookshelf' ? null : 'bookshelf')}
                      className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      📚 {t('bookshelf')} ▼
                    </button>
                    {openDropdown === 'bookshelf' && (
                      <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-48 overflow-y-auto min-w-40">
                        <button
                          onClick={() => {
                            setSelectedBookshelf(null)
                            setSelectedShelf(null)
                            setOpenDropdown(null)
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${selectedBookshelf === null ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {t('allBookshelvesFilter')}
                        </button>
                        {availableBookshelves.map((bs) => (
                          <button
                            key={bs.id}
                            onClick={() => {
                              setSelectedBookshelf(bs.id)
                              setSelectedShelf(null)
                              setOpenDropdown(null)
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm transition ${selectedBookshelf === bs.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                          >
                            {bs.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Shelf Filter Dropdown */}
                {statusFilter === 'library' && selectedBookshelf && (
                  <div className="relative">
                    <button
                      data-dropdown-button="shelf"
                      onClick={() => setOpenDropdown(openDropdown === 'shelf' ? null : 'shelf')}
                      className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      🗂️ {t('shelf')} ▼
                    </button>
                    {openDropdown === 'shelf' && (
                      <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-48 overflow-y-auto min-w-40">
                        <button
                          onClick={() => {
                            setSelectedShelf(null)
                            setOpenDropdown(null)
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${selectedShelf === null ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {t('allShelvesFilter')}
                        </button>
                        {availableShelves.map((shelf) => (
                          <button
                            key={shelf.id}
                            onClick={() => {
                              setSelectedShelf(shelf.id)
                              setOpenDropdown(null)
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm transition ${selectedShelf === shelf.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                          >
                            #{shelf.order} {shelf.name ? `: ${shelf.name}` : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* User Filter Dropdown (only for Borrowed status) */}
                {statusFilter === 'borrowed' && (
                  <div className="relative">
                    <button
                      data-dropdown-button="user"
                      onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
                      className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      👤 {t('user')} ▼
                    </button>
                    {openDropdown === 'user' && (
                      <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-48 overflow-y-auto min-w-40">
                        <button
                          onClick={() => {
                            setSelectedUser(null)
                            setOpenDropdown(null)
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${selectedUser === null ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {t('allUsersFilter')}
                        </button>
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
                            <button
                              key={user.id}
                              onClick={() => {
                                setSelectedUser(user.id)
                                setOpenDropdown(null)
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm transition ${selectedUser === user.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                            >
                              {user.name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Date Filter Dropdown */}
                <div className="relative">
                  <button
                    data-dropdown-button="date"
                    onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
                    className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-1"
                  >
                    <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                    {t('manageBooksFilterTime')} ▼
                  </button>
                  {openDropdown === 'date' && (
                    <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-3 min-w-64">
                      <div className="space-y-2">
                        <select
                          value={dateFilterType}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setDateFilterType(e.target.value as 'none' | 'date_month_year' | 'month_year' | 'quarter_year' | 'year')
                            setDateFilterFrom('')
                            setDateFilterTo('')
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="none">{t('manageBooksFilterNone')}</option>
                          <option value="date_month_year">{t('manageBooksFilterDate')}</option>
                          <option value="month_year">{t('manageBooksFilterMonth')}</option>
                          <option value="quarter_year">{t('manageBooksFilterQuarter')}</option>
                          <option value="year">{t('manageBooksFilterYear')}</option>
                        </select>

                        {dateFilterType === 'date_month_year' && (
                          <>
                            <div>
                              <label className="text-xs font-medium text-gray-700">{t('from')}</label>
                              <input
                                type="date"
                                value={dateFilterFrom}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilterFrom(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">{t('to')}</label>
                              <input
                                type="date"
                                value={dateFilterTo}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilterTo(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </>
                        )}

                        {dateFilterType === 'month_year' && (
                          <>
                            <div>
                              <label className="text-xs font-medium text-gray-700">{t('from')}</label>
                              <input
                                type="month"
                                value={dateFilterFrom}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilterFrom(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">{t('to')}</label>
                              <input
                                type="month"
                                value={dateFilterTo}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilterTo(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </>
                        )}

                        {dateFilterType === 'quarter_year' && (
                          <>
                            <div>
                              <label className="text-xs font-medium text-gray-700">{t('from')}</label>
                              <div className="flex gap-1">
                                <select
                                  value={dateFilterFrom ? dateFilterFrom.split('-')[1] : ''}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const year = dateFilterFrom ? dateFilterFrom.split('-')[0] : new Date().getFullYear()
                                    setDateFilterFrom(e.target.value ? `${year}-${e.target.value}` : '')
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                >
                                  <option value="">Q</option>
                                  <option value="Q1">Q1</option>
                                  <option value="Q2">Q2</option>
                                  <option value="Q3">Q3</option>
                                  <option value="Q4">Q4</option>
                                </select>
                                <input
                                  type="number"
                                  min="1900"
                                  max="2099"
                                  value={dateFilterFrom ? dateFilterFrom.split('-')[0] : ''}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const quarter = dateFilterFrom ? dateFilterFrom.split('-')[1] : 'Q1'
                                    setDateFilterFrom(e.target.value ? `${e.target.value}-${quarter}` : '')
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                  placeholder="Year"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">{t('to')}</label>
                              <div className="flex gap-1">
                                <select
                                  value={dateFilterTo ? dateFilterTo.split('-')[1] : ''}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const year = dateFilterTo ? dateFilterTo.split('-')[0] : new Date().getFullYear()
                                    setDateFilterTo(e.target.value ? `${year}-${e.target.value}` : '')
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                >
                                  <option value="">Q</option>
                                  <option value="Q1">Q1</option>
                                  <option value="Q2">Q2</option>
                                  <option value="Q3">Q3</option>
                                  <option value="Q4">Q4</option>
                                </select>
                                <input
                                  type="number"
                                  min="1900"
                                  max="2099"
                                  value={dateFilterTo ? dateFilterTo.split('-')[0] : ''}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const quarter = dateFilterTo ? dateFilterTo.split('-')[1] : 'Q4'
                                    setDateFilterTo(e.target.value ? `${e.target.value}-${quarter}` : '')
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                  placeholder="Year"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {dateFilterType === 'year' && (
                          <>
                            <div>
                              <label className="text-xs font-medium text-gray-700">{t('from')}</label>
                              <input
                                type="number"
                                min="1900"
                                max="2099"
                                placeholder={t('year')}
                                value={dateFilterFrom}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilterFrom(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">{t('to')}</label>
                              <input
                                type="number"
                                min="1900"
                                max="2099"
                                placeholder={t('year')}
                                value={dateFilterTo}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilterTo(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
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
                    title={t('sortByNameAZ')}
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
                    title={t('sortByNameZA')}
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
                    title={t('newestFirst')}
                  >
                    <img src="/thirty-one-date.png" alt="Newest" className="w-4 h-4" /> {t('newestFirst')}
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
                    title={t('oldestFirst')}
                  >
                    <img src="/number-1-date.png" alt="Oldest" className="w-4 h-4" /> {t('oldestFirst')}
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {(statusFilter !== 'all' || searchTerm || selectedLibrary || selectedBookshelf || selectedShelf || selectedUser || dateFilterType !== 'none') && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                  {statusFilter !== 'all' && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <div className="flex items-center gap-1">
                        {statusFilter === 'storage' && <img src="/box.png" alt="Storage" className="w-4 h-4" />}
                        {statusFilter === 'library' && <img src="/library.png" alt="Library" className="w-4 h-4" />}
                        {statusFilter === 'borrowing' && <img src="/borrow.png" alt="Borrowing" className="w-4 h-4" />}
                        <span>{statusFilter}</span>
                      </div>
                      <button
                        onClick={() => {
                          setStatusFilter('all')
                          setSelectedLibrary(null)
                          setSelectedBookshelf(null)
                          setSelectedShelf(null)
                          setSelectedUser(null)
                        }}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {selectedLibrary && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <span>🏛️ {libraries.find(l => l.id === selectedLibrary)?.name}</span>
                      <button
                        onClick={() => {
                          setSelectedLibrary(null)
                          setSelectedBookshelf(null)
                          setSelectedShelf(null)
                        }}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {selectedBookshelf && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <span>📚 {allBookshelves.find(bs => bs.id === selectedBookshelf)?.name}</span>
                      <button
                        onClick={() => {
                          setSelectedBookshelf(null)
                          setSelectedShelf(null)
                        }}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {selectedShelf && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <span>🗂️ #{allShelves.find(s => s.id === selectedShelf)?.order} {allShelves.find(s => s.id === selectedShelf)?.name}</span>
                      <button
                        onClick={() => setSelectedShelf(null)}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {selectedUser && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <span>👤 {books.find(b => b.borrowed_by_user_id === selectedUser)?.borrowed_by_user_name}</span>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {searchTerm && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <span>🔍 {searchTerm}</span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {dateFilterType !== 'none' && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <span>
                        {dateFilterType === 'date_month_year' && (
                          <>Full Date: {dateFilterFrom && dateFilterTo ? `${dateFilterFrom} - ${dateFilterTo}` : dateFilterFrom || dateFilterTo || 'All'}</>
                        )}
                        {dateFilterType === 'month_year' && (
                          <>Month/Year: {dateFilterFrom && dateFilterTo ? `${dateFilterFrom} - ${dateFilterTo}` : dateFilterFrom || dateFilterTo || 'All'}</>
                        )}
                        {dateFilterType === 'quarter_year' && (
                          <>Quarter/Year: {dateFilterFrom && dateFilterTo ? `${dateFilterFrom} - ${dateFilterTo}` : dateFilterFrom || dateFilterTo || 'All'}</>
                        )}
                        {dateFilterType === 'year' && (
                          <>Year: {dateFilterFrom && dateFilterTo ? `${dateFilterFrom} - ${dateFilterTo}` : dateFilterFrom || dateFilterTo || 'All'}</>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setDateFilterType('none')
                          setDateFilterFrom('')
                          setDateFilterTo('')
                        }}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Results Count and Layout Toggle */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-gray-500">
                  {filteredBooks.length} / {books.length} {t('books')}
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
                    title={`1 ${t('columnLayout')}`}
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
                    title={`2 ${t('columnLayout')}`}
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
                <p className="text-gray-500">{t('noMatchingBooks')}</p>
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
                                      title={t('moveToShelf')}
                                    >
                                      <img src="/shelf.png" alt={t('moveToShelf')} className="w-5 h-5" />
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
                                          <p className="text-gray-600 font-medium">{t('borrowedByLabel')}</p>
                                          <p className="text-purple-600 font-semibold mt-1">
                                            {book.borrowed_by_user_name}
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-500">{t('noUserInformation')}</p>
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
                                  title={t('edit')}
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => onDeleteBook(book.id, book.shelf_id || null)}
                                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title={t('delete')}
                                >
                                  <img src="/trash.png" alt={t('delete')} className="w-5 h-5" />
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
