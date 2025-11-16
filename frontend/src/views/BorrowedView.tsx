import React, { useState, useEffect } from 'react'
import type { Book, User, Borrowing } from '@/types'
import { useBorrowings } from '@/hooks'
import { useLanguage } from '@/contexts/LanguageContext'
import { BookDetailModal, UserDetailModal } from '@/components/modals'

interface BorrowedViewProps {
  books: Book[]
  users: User[]
  detailPopup: { type: string; data: any } | null
  onSetDetailPopup: (popup: { type: string; data: any } | null) => void
  onReturnBook: (bookId: number) => Promise<void>
  onNavigateBack: () => void
  onRefreshData?: () => Promise<void>
  onShowReturnConfirmation?: (borrowing: Borrowing) => void
}

export const BorrowedView: React.FC<BorrowedViewProps> = ({
  books,
  users,
  detailPopup,
  onSetDetailPopup,
  onReturnBook,
  onNavigateBack,
  onRefreshData,
  onShowReturnConfirmation,
}) => {
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null)
  const [selectedBookDetail, setSelectedBookDetail] = useState<Book | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'borrowing' | 'returned'>('borrowing')
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [selectedBook, setSelectedBook] = useState<number | null>(null)
  const [borrowDateFrom, setBorrowDateFrom] = useState('')
  const [borrowDateTo, setBorrowDateTo] = useState('')
  const [returnDateFrom, setReturnDateFrom] = useState('')
  const [returnDateTo, setReturnDateTo] = useState('')
  const [sortBy, setSortBy] = useState<'borrow' | 'return'>('borrow')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  
  const { borrowings, loading, fetchBorrowings, returnBorrowing } = useBorrowings()
  const { t } = useLanguage()
  
  useEffect(() => {
    fetchBorrowings()
  }, [fetchBorrowings])

  // Refresh borrowings when books change (triggered by modal return completion)
  useEffect(() => {
    if (onRefreshData) {
      fetchBorrowings()
    }
  }, [books, fetchBorrowings])
  
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
  
  const getUserById = (userId: number | null) => {
    if (!userId) return null
    return users.find(u => u.id === userId)
  }
  
  const getBookById = (bookId: number) => {
    return books.find(b => b.id === bookId)
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  const formatDateOnly = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return '-'
    }
  }
  
  // Filter borrowings based on all criteria
  const filteredBorrowings = borrowings.filter(borrowing => {
    // Filter by session status
    const isReturned = borrowing.return_date !== null
    if (statusFilter === 'borrowing' && isReturned) return false
    if (statusFilter === 'returned' && !isReturned) return false

    // Filter by search term (borrow notes or return notes only)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      const borrowNotesMatch = borrowing.notes?.toLowerCase().includes(searchLower) || false
      const returnNotesMatch = borrowing.return_notes?.toLowerCase().includes(searchLower) || false
      const notesMatch = borrowNotesMatch || returnNotesMatch
      if (!notesMatch) return false
    }

    // Filter by user
    if (selectedUser && borrowing.user_id !== selectedUser) return false

    // Filter by book
    if (selectedBook && borrowing.book_id !== selectedBook) return false

    // Filter by borrow date range
    if (borrowDateFrom) {
      const borrowDate = new Date(borrowing.borrow_date).getTime()
      const fromDate = new Date(borrowDateFrom).getTime()
      if (borrowDate < fromDate) return false
    }
    if (borrowDateTo) {
      const borrowDate = new Date(borrowing.borrow_date).getTime()
      const toDate = new Date(borrowDateTo + 'T23:59:59').getTime()
      if (borrowDate > toDate) return false
    }

    // Filter by return date range
    if (borrowing.return_date) {
      if (returnDateFrom) {
        const returnDate = new Date(borrowing.return_date).getTime()
        const fromDate = new Date(returnDateFrom).getTime()
        if (returnDate < fromDate) return false
      }
      if (returnDateTo) {
        const returnDate = new Date(borrowing.return_date).getTime()
        const toDate = new Date(returnDateTo + 'T23:59:59').getTime()
        if (returnDate > toDate) return false
      }
    }

    return true
  }).sort((a, b) => {
    let compareResult = 0

    if (sortBy === 'borrow') {
      const dateA = new Date(a.borrow_date).getTime()
      const dateB = new Date(b.borrow_date).getTime()
      compareResult = dateA - dateB
    } else if (sortBy === 'return') {
      const dateA = a.return_date ? new Date(a.return_date).getTime() : Infinity
      const dateB = b.return_date ? new Date(b.return_date).getTime() : Infinity
      compareResult = dateA - dateB
    }

    return sortOrder === 'asc' ? compareResult : -compareResult
  })

  const handleReturnBorrowing = async (borrowingId: number) => {
    // Find the borrowing record
    const borrowing = borrowings.find(b => b.id === borrowingId)
    if (!borrowing) return

    // Show return confirmation modal if callback is provided
    if (onShowReturnConfirmation) {
      onShowReturnConfirmation(borrowing)
      // onRefreshData will be called by the modal after successful return via App.tsx callback
      // BorrowedView needs to refresh its local borrowings after the modal closes
      // This is handled through the callback chain in App.tsx
    } else {
      // Fallback to direct return with confirmation dialog
      if (window.confirm(`Return this book?`)) {
        await returnBorrowing(borrowingId)
        if (onRefreshData) {
          await onRefreshData()
        }
        await fetchBorrowings()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateBack}
                className="text-blue-600 hover:text-blue-700 font-medium"
                title={t('goBackToDashboard')}
              >
                🏠
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              <img src="/borrow.png" alt="Borrowed" className="w-8 h-8" /> {t('dashboardManageBorrowings')}
            </h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && borrowings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">{t('loadingBorrowingData')}</p>
          </div>
        ) : borrowings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">{t('noBorrowingHistory')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search and Filters Section */}
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              {/* Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('searchForNotes')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* Filters */}
                <div className="flex gap-1 flex-wrap relative">
                  {/* Status Filter */}
                  <div className="relative">
                    <button
                      data-dropdown-button="status"
                      onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                      className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      {t('statusFilter')} ▼
                    </button>
                    {openDropdown === 'status' && (
                      <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-40">
                        <button
                          onClick={() => {
                            setStatusFilter('all')
                            setOpenDropdown(null)
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${statusFilter === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {t('all')}
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter('borrowing')
                            setOpenDropdown(null)
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${statusFilter === 'borrowing' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {t('borrowing')}
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter('returned')
                            setOpenDropdown(null)
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${statusFilter === 'returned' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {t('returned')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Filter */}
                  <div className="relative">
                    <button
                      data-dropdown-button="user"
                      onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
                      className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      👤 {t('userFilter')} ▼
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
                          {t('allUsers')}
                        </button>
                        {users.map(user => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user.id)
                              setOpenDropdown(null)
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm transition ${selectedUser === user.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                          >
                            {user.full_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Book Filter */}
                  <div className="relative">
                    <button
                      data-dropdown-button="book"
                      onClick={() => setOpenDropdown(openDropdown === 'book' ? null : 'book')}
                      className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      📚 {t('bookFilter')} ▼
                    </button>
                    {openDropdown === 'book' && (
                      <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-48 overflow-y-auto min-w-48">
                        <button
                          onClick={() => {
                            setSelectedBook(null)
                            setOpenDropdown(null)
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition ${selectedBook === null ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {t('allBooks')}
                        </button>
                        {books.map(book => (
                          <button
                            key={book.id}
                            onClick={() => {
                              setSelectedBook(book.id)
                              setOpenDropdown(null)
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm transition ${selectedBook === book.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                          >
                            {book.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Borrow Date Range Filter */}
                  <div className="relative">
                    <button
                      data-dropdown-button="borrow"
                      onClick={() => setOpenDropdown(openDropdown === 'borrow' ? null : 'borrow')}
                      className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-1"
                    >
                      <img src="/borrow.png" alt="Borrow Date" className="w-4 h-4" />
                      {t('borrowDateFilter')} ▼
                    </button>
                    {openDropdown === 'borrow' && (
                      <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-3 min-w-48">
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium text-gray-700">{t('from')}</label>
                            <input
                              type="date"
                              value={borrowDateFrom}
                              onChange={(e) => setBorrowDateFrom(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">{t('to')}</label>
                            <input
                              type="date"
                              value={borrowDateTo}
                              onChange={(e) => setBorrowDateTo(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Return Date Range Filter */}
                  <div className="relative">
                    <button
                      data-dropdown-button="return"
                      onClick={() => setOpenDropdown(openDropdown === 'return' ? null : 'return')}
                      className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-1"
                    >
                      <img src="/return_book.png" alt="Return Date" className="w-4 h-4" />
                      {t('returnDateFilter')} ▼
                    </button>
                    {openDropdown === 'return' && (
                      <div data-dropdown-content className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 p-3 min-w-48">
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium text-gray-700">{t('from')}</label>
                            <input
                              type="date"
                              value={returnDateFrom}
                              onChange={(e) => setReturnDateFrom(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">{t('to')}</label>
                            <input
                              type="date"
                              value={returnDateTo}
                              onChange={(e) => setReturnDateTo(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => {
                      setSortBy('borrow')
                      setSortOrder('desc')
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                      sortBy === 'borrow' && sortOrder === 'desc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={t('sortByBorrowDateLatest')}
                  >
                    <img src="/thirty-one-date.png" alt="Latest" className="w-4 h-4" />
                    {t('borrowDateColumn')}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('borrow')
                      setSortOrder('asc')
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                      sortBy === 'borrow' && sortOrder === 'asc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={t('sortByBorrowDateOldest')}
                  >
                    <img src="/number-1-date.png" alt="Oldest" className="w-4 h-4" />
                    {t('borrowDateColumn')}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('return')
                      setSortOrder('desc')
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                      sortBy === 'return' && sortOrder === 'desc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={t('sortByReturnDateLatest')}
                  >
                    <img src="/thirty-one-date.png" alt="Latest" className="w-4 h-4" />
                    {t('returnDateColumn')}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('return')
                      setSortOrder('asc')
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                      sortBy === 'return' && sortOrder === 'asc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={t('sortByReturnDateOldest')}
                  >
                    <img src="/number-1-date.png" alt="Oldest" className="w-4 h-4" />
                    {t('returnDateColumn')}
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {(statusFilter !== 'all' || searchTerm || selectedUser || selectedBook || borrowDateFrom || borrowDateTo || returnDateFrom || returnDateTo) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                  {statusFilter !== 'all' && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <img 
                        src={statusFilter === 'borrowing' ? '/borrow.png' : '/return_book.png'} 
                        alt={statusFilter === 'borrowing' ? 'Borrowing' : 'Returned'}
                        className="w-4 h-4"
                      />
                      <span>{statusFilter === 'borrowing' ? t('borrowing') : t('returned')}</span>
                      <button
                        onClick={() => setStatusFilter('all')}
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
                  {selectedUser && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <span>👤 {getUserById(selectedUser)?.full_name}</span>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {selectedBook && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <span>📚 {getBookById(selectedBook)?.title}</span>
                      <button
                        onClick={() => setSelectedBook(null)}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {(borrowDateFrom || borrowDateTo) && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <img src="/borrow.png" alt="Borrow Date" className="w-4 h-4" />
                      <span>{borrowDateFrom && new Date(borrowDateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {borrowDateTo && new Date(borrowDateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <button
                        onClick={() => {
                          setBorrowDateFrom('')
                          setBorrowDateTo('')
                        }}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {(returnDateFrom || returnDateTo) && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                      <img src="/return_book.png" alt="Return Date" className="w-4 h-4" />
                      <span>{returnDateFrom && new Date(returnDateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {returnDateTo && new Date(returnDateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <button
                        onClick={() => {
                          setReturnDateFrom('')
                          setReturnDateTo('')
                        }}
                        className="hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Borrowing Records Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('borrowStatusTable')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('bookColumn')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('userColumn')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('borrowDateColumn')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('returnDateColumn')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('borrowNoteColumn')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('returnNoteColumn')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('actionColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBorrowings.map((borrowing: Borrowing) => {
                      const user = getUserById(borrowing.user_id)
                      const book = getBookById(borrowing.book_id)
                      const isReturned = borrowing.return_date !== null
                      
                      return (
                        <tr key={borrowing.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm">
                            <img 
                              src={isReturned ? '/return_book.png' : '/borrow.png'} 
                              alt={isReturned ? 'Returned' : 'Borrowing'}
                              className="w-6 h-6"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{book?.title || t('unknownBook')}</span>
                              <button
                                onClick={() => setSelectedBookDetail(book || null)}
                                className="text-blue-600 hover:text-blue-700 font-bold"
                                title={t('viewBookDetails')}
                              >
                                ℹ️
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-medium text-gray-900">{user?.full_name || t('unknown')}</p>
                                {user?.department && <p className="text-xs text-gray-500">{user.department}</p>}
                              </div>
                              <button
                                onClick={() => setSelectedUserDetail(user || null)}
                                className="text-blue-600 hover:text-blue-700 font-bold"
                                title={t('viewUserDetails')}
                              >
                                ℹ️
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(borrowing.borrow_date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{isReturned ? formatDateTime(borrowing.return_date) : '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {borrowing.notes ? (
                              <div className="bg-blue-50 rounded px-2 py-1 text-blue-900 whitespace-pre-wrap">
                                {borrowing.notes}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {borrowing.return_notes ? (
                              <div className="bg-green-50 rounded px-2 py-1 text-green-900 whitespace-pre-wrap">
                                {borrowing.return_notes}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {!isReturned && (
                              <button 
                                onClick={() => handleReturnBorrowing(borrowing.id)} 
                                className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 transition"
                              >
                                <img src="/return_book.png" alt="Return" className="w-3 h-3" />
                                {t('returnBookButton')}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedUserDetail && (
        <UserDetailModal user={selectedUserDetail} onClose={() => setSelectedUserDetail(null)} />
      )}

      {selectedBookDetail && (
        <BookDetailModal book={selectedBookDetail} onClose={() => setSelectedBookDetail(null)} />
      )}
    </div>
  )
}
