import React, { useState } from 'react'
import type { User, Book } from '@/types'

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

interface ManageUsersViewProps {
  users: User[]
  books: Book[]
  error: string | null
  onBackClick: () => void
  onAddUserClick: () => void
  onEditUser: (user: User) => void
  onDeleteUser: (userId: number) => void
  onReturnBook?: (bookId: number) => Promise<void>
  onRetry?: () => void
}

const getGenderDisplay = (gender: string): string => {
  const genderMap: { [key: string]: string } = {
    'M': '♂️ Male',
    'F': '♀️ Female',
    'O': '⚪ Other'
  }
  return genderMap[gender] || gender
}

export const ManageUsersView: React.FC<ManageUsersViewProps> = ({
  users,
  books,
  error,
  onBackClick,
  onAddUserClick,
  onEditUser,
  onDeleteUser,
  onReturnBook,
  onRetry,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [columnsView, setColumnsView] = useState<1 | 2>(1)
  const [borrowedPopupUserId, setBorrowedPopupUserId] = useState<number | null>(null)

  // Get unique departments from users
  const uniqueDepartments = Array.from(
    new Set(users.map(u => u.department).filter((d): d is string => d !== null && d !== undefined))
  ).sort()

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
        (user.short_description && user.short_description.toLowerCase().includes(searchLower)) ||
        (user.long_description && user.long_description.toLowerCase().includes(searchLower))
      
      const matchesDepartment = !selectedDepartment || user.department === selectedDepartment
      
      return matchesSearch && matchesDepartment
    })
    .sort((a, b) => {
      const comparison = (a.full_name || '').localeCompare(b.full_name || '')
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Get books borrowed by a user
  const getBorrowedBooks = (userId: number) => {
    return books.filter(book => book.status === 'borrowed' && book.borrowed_by_user_id === userId)
  }

  // Close popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: React.MouseEvent<Document>) => {
      const target = event.target as HTMLElement
      const statusButton = target.closest('[data-borrowed-button]')
      
      if (!statusButton) {
        setBorrowedPopupUserId(null)
      }
    }

    if (borrowedPopupUserId !== null) {
      document.addEventListener('click', handleClickOutside as any)
      return () => {
        document.removeEventListener('click', handleClickOutside as any)
      }
    }
  }, [borrowedPopupUserId])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBackClick} className="text-blue-600 hover:text-blue-700 font-medium" title="Go back to dashboard">
                🏠
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              <img src="/group.png" alt="Manage Users" className="w-8 h-8" />
              Manage Users
            </h1>
            <div>
              <button
                onClick={onAddUserClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Add New User
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

        {error && users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">Failed to load users. The backend server might be unavailable.</p>
            <p className="text-gray-500 text-sm mb-6">Please check your connection and try again.</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
              >
                🔄 Retry Loading Users
              </button>
            )}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No users yet. Click "Add New User" button to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search, Filter, and Sort Section */}
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              {/* Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search users by name, phone, short desc, long desc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* Department Filter */}
                <select
                  value={selectedDepartment || ''}
                  onChange={(e) => setSelectedDepartment(e.target.value || null)}
                  className="px-3 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                {/* Sort Controls */}
                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      sortOrder === 'asc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Sort by name A-Z"
                  >
                    A-Z
                  </button>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      sortOrder === 'desc'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Sort by name Z-A"
                  >
                    Z-A
                  </button>
                </div>
              </div>

              {/* Results Count and Layout Toggle */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-gray-500">
                  {filteredUsers.length} of {users.length} users
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

            {/* Users Grid/List */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No users match your search or filter criteria.</p>
              </div>
            ) : (
              <div className={columnsView === 2 ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
                {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  {/* User Information */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-lg text-gray-900">{user.full_name}</p>
                      {/* Status badge and action buttons */}
                      <div className="flex items-center gap-2 ml-2">
                        {/* Borrowed Books Status */}
                        <div className="relative">
                          <button
                            onClick={() => setBorrowedPopupUserId(borrowedPopupUserId === user.id ? null : user.id)}
                            className="px-2 py-1 text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded cursor-pointer hover:opacity-80 transition-opacity"
                            data-borrowed-button
                          >
                            📚 {getBorrowedBooks(user.id).length}
                          </button>
                        {/* Borrowed Books Popup */}
                          {borrowedPopupUserId === user.id && (
                            <div 
                              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                              onClick={() => setBorrowedPopupUserId(null)}
                            >
                              <div 
                                className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Sticky Header */}
                                <div className="flex justify-between items-center mb-6 p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                                  <h2 className="text-2xl font-bold text-gray-900">
                                    📚 Books Borrowed by <span className="text-blue-600">{user.full_name}</span>
                                  </h2>
                                  <button
                                    onClick={() => setBorrowedPopupUserId(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                                    title="Close"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="overflow-y-auto flex-1 px-6 pb-6">

                                {getBorrowedBooks(user.id).length === 0 ? (
                                  <p className="text-sm text-gray-500 text-center py-8">No borrowed books</p>
                                ) : (
                                  <div className="space-y-3">
                                    {getBorrowedBooks(user.id).map((book) => (
                                      <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400 hover:shadow-lg transition">
                                        <div className="flex items-start gap-4">
                                          {/* Book Information */}
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                              <p className="font-bold text-lg text-gray-900">{book.title}</p>
                                              {/* Return button */}
                                              {onReturnBook && (
                                                <button
                                                  onClick={() => {
                                                    if (window.confirm(`Are you sure you want to return "${book.title}" to storage?`)) {
                                                      onReturnBook(book.id)
                                                      setBorrowedPopupUserId(null)
                                                    }
                                                  }}
                                                  className="p-1 hover:bg-blue-50 rounded transition-colors ml-2"
                                                  title="Return book to storage"
                                                >
                                                  <img src="/return_book.png" alt="Return to storage" className="w-5 h-5" />
                                                </button>
                                              )}
                                            </div>

                                            {/* Book Details */}
                                            <div className="flex gap-4 mb-2">
                                              <div className="w-3/10">
                                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                                  <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                                                  <span>{book.author || '-'}</span>
                                                </p>
                                              </div>
                                              <div className="w-3/10">
                                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                                  <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                                                  <span>{formatDateAsddmmyy(book.year)}</span>
                                                </p>
                                              </div>
                                            </div>

                                            {/* Short Description */}
                                            {book.short_description && (
                                              <p className="text-sm text-gray-700 border-t border-gray-200 pt-2">
                                                {book.short_description}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Edit and Delete buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEditUser(user)}
                            className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit user"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="px-2 py-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete user"
                          >
                            <img src="/trash.png" alt="Delete" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="flex gap-4 mb-2">
                      {/* Gender */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {getGenderDisplay(user.gender)}
                        </p>
                      </div>
                      
                      {/* Department */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <img src="/office-building.png" alt="Department" className="w-4 h-4" />
                          {user.department || '-'}
                        </p>
                      </div>

                      {/* Phone */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <img src="/telephone.png" alt="Phone" className="w-4 h-4" />
                          {user.phone || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Short Description */}
                    {user.short_description && (
                      <p className="text-sm text-gray-700 border-t border-gray-200 pt-2">
                        {user.short_description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
