import React, { useState, useEffect } from 'react'
import type { Book, Library, Bookshelf, Shelf } from '@/types'

interface MoveBookModalProps {
  book: Book | null
  libraries: Library[]
  allBookshelves: Bookshelf[]
  allShelves: Shelf[]
  onClose: () => void
  onMove: (bookId: number, shelfId: number) => Promise<void>
}

export const MoveBookModal: React.FC<MoveBookModalProps> = ({
  book,
  libraries,
  allBookshelves,
  allShelves,
  onClose,
  onMove,
}) => {
  const [selectedLibraryId, setSelectedLibraryId] = useState('')
  const [selectedBookshelfId, setSelectedBookshelfId] = useState('')
  const [selectedShelfId, setSelectedShelfId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedLibraryId('')
    setSelectedBookshelfId('')
    setSelectedShelfId('')
    setError(null)
  }, [book])

  if (!book) return null

  const filteredBookshelves = allBookshelves.filter(
    (bs) => bs.library_id === parseInt(selectedLibraryId)
  )

  const filteredShelves = allShelves.filter(
    (s) => s.bookshelf_id === parseInt(selectedBookshelfId)
  )

  const handleMove = async () => {
    if (!selectedShelfId) return

    if (!window.confirm(`Are you sure you want to move "${book.title}" to the selected shelf?`)) return

    setIsLoading(true)
    setError(null)
    try {
      await onMove(book.id, parseInt(selectedShelfId))
      setSelectedLibraryId('')
      setSelectedBookshelfId('')
      setSelectedShelfId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move book')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <img src="/shelf.png" alt="Shelf" className="w-6 h-6" /> Move to Shelf
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-800">{book.title}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Library Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Library
            </label>
            <select
              value={selectedLibraryId}
              onChange={(e) => {
                setSelectedLibraryId(e.target.value)
                setSelectedBookshelfId('')
                setSelectedShelfId('')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isLoading}
            >
              <option value="">-- Choose a library --</option>
              {libraries.map((library) => (
                <option key={library.id} value={library.id.toString()}>
                  {library.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bookshelf Selection */}
          {selectedLibraryId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bookshelf
              </label>
              <select
                value={selectedBookshelfId}
                onChange={(e) => {
                  setSelectedBookshelfId(e.target.value)
                  setSelectedShelfId('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isLoading}
              >
                <option value="">-- Choose a bookshelf --</option>
                {filteredBookshelves.map((bookshelf) => (
                  <option key={bookshelf.id} value={bookshelf.id.toString()}>
                    {bookshelf.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Shelf Selection */}
          {selectedBookshelfId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Shelf
              </label>
              <select
                value={selectedShelfId}
                onChange={(e) => setSelectedShelfId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isLoading}
              >
                <option value="">-- Choose a shelf --</option>
                {filteredShelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>
                    #{shelf.order}{shelf.name ? `: ${shelf.name}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={!selectedShelfId || isLoading}
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Moving...' : 'Move Book'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MoveBookModal
