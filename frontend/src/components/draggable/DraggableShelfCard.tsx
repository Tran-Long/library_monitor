import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Shelf, Book } from '@/types'

interface DraggableShelfCardProps {
  shelf: Shelf
  books: Book[]
  onShelfClick: (shelf: Shelf) => void
  onAddBook: (shelf: Shelf) => void
  onDeleteShelf: (shelfId: number) => void
  onMoveBook: (bookId: number, shelfId: number) => void
}

export const DraggableShelfCard: React.FC<DraggableShelfCardProps> = ({
  shelf,
  books,
  onShelfClick,
  onAddBook,
  onDeleteShelf,
  onMoveBook,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: shelf.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style as any} className={`relative pb-6 ${isDragging ? 'scale-95 opacity-50' : ''}`}>
      <div className="flex items-center gap-4">
        <div
          className="flex-shrink-0 pt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 text-lg"
          {...listeners}
          {...attributes}
          title="Drag to reorder shelf"
        >
          ≡
        </div>
        <div className="flex-1">
          <button
            onClick={() => onShelfClick(shelf)}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => {
              e.preventDefault()
              const bookId = parseInt(e.dataTransfer.getData('bookId'))
              if (bookId) {
                onMoveBook(bookId, shelf.id)
              }
            }}
            className="w-full text-left border-t-4 border-amber-800 relative hover:bg-amber-50 transition-colors p-2 rounded-t"
          >
            <div className="absolute -top-3 left-0 bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200 flex items-center gap-1">
              <img src="/shelf.png" alt="Shelf" className="w-4 h-4" /> #{shelf.order}
              {shelf.name ? `: ${shelf.name}` : ''} • 📚 Books: {books.length}
            </div>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddBook(shelf)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-green-50 transition-colors"
            title="Add book"
          >
            <img src="/add_book.png" alt="Add book" className="w-6 h-6" />
          </button>
          {shelf.long_description && (
            <button
              onClick={() => {}}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              title="View details"
            >
              ℹ️
            </button>
          )}
          <button
            onClick={() => onDeleteShelf(shelf.id)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
            title="Delete shelf"
          >
            <img src="/screw.png" alt="Delete shelf" className="w-6 h-6" />
          </button>
        </div>
      </div>
      {shelf.short_description && (
        <p className="text-sm text-gray-600 mt-2 ml-4">{shelf.short_description}</p>
      )}
    </div>
  )
}

export default DraggableShelfCard
