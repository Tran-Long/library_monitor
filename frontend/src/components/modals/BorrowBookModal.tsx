import React, { useState, useEffect } from 'react'
import type { Book, User } from '@/types'

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

interface BorrowBookModalProps {
  book: Book | null
  users: User[]
  onClose: () => void
  onBorrow?: (bookId: number, userId: number) => Promise<void>
  onUserSelected?: (book: Book, user: User) => void
  useConfirmationFlow?: boolean
}

export const BorrowBookModal: React.FC<BorrowBookModalProps> = ({
  book,
  users,
  onClose,
  onBorrow,
  onUserSelected,
  useConfirmationFlow = false,
}) => {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedUserId('')
    setError(null)
  }, [book])

  if (!book) return null

  const handleSelectUser = () => {
    if (!selectedUserId) {
      setError('Please select a user')
      return
    }

    const selectedUser = users.find((u: User) => u.id === parseInt(selectedUserId))
    if (selectedUser && onUserSelected) {
      onUserSelected(book, selectedUser)
      setSelectedUserId('')
    }
  }

  const handleBorrow = async () => {
    if (!selectedUserId || !onBorrow) return

    setIsLoading(true)
    setError(null)
    try {
      await onBorrow(book.id, parseInt(selectedUserId))
      setSelectedUserId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow book')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <img src="/borrow.png" alt="Borrow" className="w-6 h-6" /> Borrow Book
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-bold text-lg text-gray-900 mb-3">{book.title}</p>
          <div className="space-y-1 mb-3">
            {book.author && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                <span>{book.author}</span>
              </p>
            )}
            {book.year && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                <span>{formatDateAsddmmyy(book.year)}</span>
              </p>
            )}
          </div>
          <div className="border-t border-gray-200 pt-2">
            <p className="text-xs text-gray-700">{book.short_description || ''}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select User to Borrow</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Choose a user --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id.toString()}>
                {user.full_name} {user.phone ? `(${user.phone})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          {useConfirmationFlow ? (
            <button
              onClick={handleSelectUser}
              disabled={!selectedUserId}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleBorrow}
              disabled={!selectedUserId || isLoading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {isLoading ? 'Borrowing...' : 'Borrow Book'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BorrowBookModal
