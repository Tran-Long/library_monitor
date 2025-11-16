import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Bookshelf } from '@/types'

interface DraggableBookshelfCardProps {
  bookshelf: Bookshelf
  bookCount: number
  onEdit: () => void
  onDelete: () => void
  onSelect: () => void
  onInfo: () => void
}

export const DraggableBookshelfCard: React.FC<DraggableBookshelfCardProps> = ({
  bookshelf,
  bookCount,
  onEdit,
  onDelete,
  onSelect,
  onInfo,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: bookshelf.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style as any}
      className={`bg-white rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition ${
        isDragging ? 'rotate-1 shadow-2xl scale-105' : ''
      }`}
    >
      <div className="flex gap-2 p-6 items-start justify-between">
        {/* Drag Handle */}
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 text-lg"
          {...listeners}
          {...attributes}
          title="Drag to reorder"
        >
          ≡
        </div>

        {/* Content Area - Clickable */}
        <div className="flex-1 cursor-pointer" onClick={onSelect}>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
              📚 {bookCount}
            </span>
            <div className="flex items-center gap-2">
              <img src="/bookshelf.png" alt="Bookshelf" className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">{bookshelf.name}</h3>
            </div>
          </div>
          {bookshelf.short_description && (
            <p className="text-sm text-gray-700 border-t border-gray-200 pt-2">
              {bookshelf.short_description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onInfo()
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            title="View details"
            aria-label="View details"
          >
            ℹ️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            title="Edit bookshelf"
            aria-label="Edit bookshelf"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
            title="Delete bookshelf"
            aria-label="Delete bookshelf"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default DraggableBookshelfCard
