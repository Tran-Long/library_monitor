import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Book } from '@/types'

interface DeleteWithMoveBooksModalProps {
  isOpen: boolean
  containerName: string
  containerType: 'library' | 'bookshelf' | 'shelf'
  books: Book[]
  onClose: () => void
  onConfirm: () => Promise<void>
}

export const DeleteWithMoveBooksModal: React.FC<DeleteWithMoveBooksModalProps> = ({
  isOpen,
  containerName,
  containerType,
  books,
  onClose,
  onConfirm,
}) => {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
      setIsLoading(false)
    }
  }

  const getTypeLabel = (): string => {
    switch (containerType) {
      case 'library':
        return t('library')
      case 'bookshelf':
        return t('bookshelf')
      case 'shelf':
        return t('shelf')
      default:
        return 'Item'
    }
  }

  const getTypeIcon = (): string => {
    switch (containerType) {
      case 'library':
        return '/library.png'
      case 'bookshelf':
        return '/bookshelf.png'
      case 'shelf':
        return '/shelf.png'
      default:
        return '/box.png'
    }
  }

  const formatDateAsddmmyy = (dateValue: string | null | undefined): string => {
    if (dateValue === null || dateValue === undefined || dateValue === '') return '-'
    
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-blue-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
            <img src={getTypeIcon()} alt={getTypeLabel()} className="w-6 h-6" />
            Delete {getTypeLabel()}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Container Info */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 font-semibold break-words text-lg">{containerName}</p>
            <p className="text-sm text-gray-600 mt-1">
              {books.length > 0 
                ? `This ${getTypeLabel().toLowerCase()} contains ${books.length} book(s). All books will be moved to storage.`
                : `This ${getTypeLabel().toLowerCase()} is empty.`}
            </p>
          </div>

          {/* Books List */}
          {books.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                📚 Books ({books.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    {/* Title */}
                    <h4 className="font-semibold text-gray-900 text-base mb-2 break-words">
                      {book.title}
                    </h4>

                    {/* Author and Year */}
                    <div className="flex gap-4 mb-3 text-sm text-gray-600">
                      {book.author && (
                        <div className="flex items-center gap-1">
                          <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                          <span className="break-words">{book.author}</span>
                        </div>
                      )}
                      {book.year && (
                        <div className="flex items-center gap-1">
                          <img src="/calendar.png" alt="Year" className="w-4 h-4" />
                          <span>{formatDateAsddmmyy(book.year)}</span>
                        </div>
                      )}
                    </div>

                    {/* Short Description */}
                    {book.short_description && (
                      <p className="text-sm text-gray-700 border-t border-gray-200 pt-2 break-words">
                        {book.short_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              <img src="/box.png" alt="Storage" className="w-4 h-4" />
              {isLoading ? t('deleting') : `Move to Storage & Delete ${getTypeLabel()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteWithMoveBooksModal
