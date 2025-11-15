import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Library } from '@/types'

interface DraggableLibraryCardProps {
  library: Library
  bookCount: number
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onInfo: () => void
}

export const DraggableLibraryCard: React.FC<DraggableLibraryCardProps> = ({
  library,
  bookCount,
  onSelect,
  onEdit,
  onDelete,
  onInfo,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: library.id })

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
      className={`bg-white rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition ${
        isDragging ? 'rotate-1 shadow-2xl scale-105' : ''
      }`}
    >
      <div className="flex gap-2 p-6">
        {/* Drag Handle */}
        <div
          className="flex-shrink-0 pt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 text-lg"
          {...listeners}
          {...attributes}
          title="Drag to reorder"
        >
          ≡
        </div>

        {/* Clickable Content Area */}
        <div className="flex-1 cursor-pointer" onClick={onSelect}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
              📚 {bookCount}
            </span>
            <div className="flex items-center gap-2">
              <img src="/library.png" alt="Library" className="w-5 h-5" />
              <h3 className="text-xl font-semibold text-gray-800">{library.name}</h3>
            </div>
          </div>
          {library.short_description && (
            <p className="text-gray-600 text-sm mt-1">{library.short_description}</p>
          )}
          <div className="mt-4 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-2">
            {library.address && (
              <p>
                <strong>📍</strong> {library.address}
              </p>
            )}
            {library.phone && (
              <p>
                <strong>📞</strong> {library.phone}
              </p>
            )}
            {library.email && (
              <p>
                <strong>📧</strong> {library.email}
              </p>
            )}
          </div>
        </div>

        {/* Info, Edit, and Delete Buttons */}
        <div className="flex gap-2 flex-shrink-0">
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
            title="Edit library"
            aria-label="Edit library"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
            title="Delete library"
            aria-label="Delete library"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default DraggableLibraryCard
