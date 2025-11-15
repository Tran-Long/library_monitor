import React, { useState, useEffect } from 'react'
import type { Book, User, Borrowing } from '@/types'

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

interface ReturnConfirmationModalProps {
  borrowing: Borrowing | null
  book: Book | null
  user: User | null
  onClose: () => void
  onConfirm: (borrowingId: number, returnDate: Date, returnNotes: string) => Promise<void>
}

const getGenderDisplay = (gender: string): string => {
  const genderMap: { [key: string]: string } = {
    'M': '♂️ Male',
    'F': '♀️ Female',
    'O': '⚪ Other'
  }
  return genderMap[gender] || gender
}

export const ReturnConfirmationModal: React.FC<ReturnConfirmationModalProps> = ({
  borrowing,
  book,
  user,
  onClose,
  onConfirm,
}) => {
  const [returnDate, setReturnDate] = useState<Date>(new Date())
  const [returnNotes, setReturnNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBookDetails, setShowBookDetails] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)

  useEffect(() => {
    setReturnDate(new Date())
    setReturnNotes('')
    setError(null)
    setShowBookDetails(false)
    setShowUserDetails(false)
  }, [borrowing, book, user])

  if (!borrowing || !book || !user) return null

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const parseLocalDateTime = (dateString: string): Date => {
    const [date, time] = dateString.split('T')
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)
    return new Date(year, month - 1, day, hours, minutes, 0)
  }

  const handleConfirm = async () => {
    setError(null)
    
    // Validate return date is after borrow date
    const borrowDateTime = new Date(borrowing.borrow_date)
    if (returnDate <= borrowDateTime) {
      setError('Return date must be after the borrow date')
      return
    }
    
    setIsLoading(true)
    try {
      await onConfirm(borrowing.id, returnDate, returnNotes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return book')
      setIsLoading(false)
    }
  }

  const borrowDateTime = new Date(borrowing.borrow_date)
  const borrowDateFormatted = borrowDateTime.toLocaleString()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <img src="/borrow.png" alt="Return Confirmation" className="w-6 h-6" /> Return Confirmation
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Book Information */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-3">📚 Book</h3>
                <p className="text-gray-700 font-semibold mb-2">{book.title}</p>
                {book.author && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                    <span>{book.author}</span>
                  </p>
                )}
                {book.year && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <img src="/calendar.png" alt="Published" className="w-4 h-4" />
                    <span>{formatDateAsddmmyy(book.year)}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowBookDetails(!showBookDetails)}
                className="p-2 hover:bg-blue-200 rounded-full transition flex-shrink-0"
                title="View book details"
              >
                ℹ️
              </button>
            </div>

            {/* Book Details Popup */}
            {showBookDetails && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="space-y-2 text-sm">
                  {book.short_description && (
                    <p>
                      <span className="font-semibold text-gray-700">Description:</span> {book.short_description}
                    </p>
                  )}
                  {book.status && (
                    <p>
                      <span className="font-semibold text-gray-700">Current Status:</span>{' '}
                      <span className="capitalize">{book.status}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-3">👤 User</h3>
                <p className="text-gray-700 font-semibold mb-3">{user.full_name}</p>
                <div className="space-y-1">
                  {user.gender && (
                    <p className="text-sm text-gray-600">
                      {getGenderDisplay(user.gender)}
                    </p>
                  )}
                  {user.department && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <img src="/office-building.png" alt="Department" className="w-4 h-4" />
                      <span>{user.department}</span>
                    </p>
                  )}
                  {user.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <img src="/telephone.png" alt="Phone" className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowUserDetails(!showUserDetails)}
                className="p-2 hover:bg-green-200 rounded-full transition flex-shrink-0"
                title="View more details"
              >
                ℹ️
              </button>
            </div>

            {/* User Details Popup */}
            {showUserDetails && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="space-y-2 text-sm">
                  {user.dob && (
                    <p>
                      <span className="font-semibold text-gray-700">Date of Birth:</span> {user.dob}
                    </p>
                  )}
                  {user.short_description && (
                    <p>
                      <span className="font-semibold text-gray-700">Description:</span> {user.short_description}
                    </p>
                  )}
                  {user.long_description && (
                    <p>
                      <span className="font-semibold text-gray-700">Details:</span> {user.long_description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Borrowed Information Group */}
          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <img src="/borrow.png" alt="Borrow" className="w-6 h-6" /> Borrowed Information
            </h3>
            <div className="space-y-3">
              {/* Borrowed Date */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <img src="/schedule.png" alt="Date" className="w-3 h-3" /> Date & Time
                </p>
                <p className="text-sm text-gray-700">{borrowDateFormatted}</p>
              </div>
              {/* Borrow Notes */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <img src="/note.png" alt="Notes" className="w-3 h-3" /> Notes
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border border-purple-300">
                  {borrowing.notes || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Return Information Group */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <img src="/return_book.png" alt="Return" className="w-6 h-6" /> Return Information
            </h3>
            <div className="space-y-3">
              {/* Return Date */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <img src="/schedule.png" alt="Date" className="w-3 h-3" /> Date & Time
                </p>
                <input
                  type="datetime-local"
                  value={formatDateTime(returnDate)}
                  onChange={(e) => {
                    const newDate = parseLocalDateTime(e.target.value)
                    if (!isNaN(newDate.getTime())) {
                      setReturnDate(newDate)
                      setError(null) // Clear error when user edits the date
                    }
                  }}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600 mt-1">
                  {returnDate.toLocaleString()}
                </p>
              </div>
              {/* Return Notes */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <img src="/note.png" alt="Notes" className="w-3 h-3" /> Notes (Optional)
                </p>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Add any notes about the return..."
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {isLoading ? 'Returning...' : 'Confirm & Return'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReturnConfirmationModal
