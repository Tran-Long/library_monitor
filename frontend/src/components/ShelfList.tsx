import React from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import type { Shelf } from '../types'

interface ShelfRowProps {
  shelf: Shelf
  onEdit: (shelf: Shelf) => void
  onDelete: (id: number) => void
}

export const ShelfRow: React.FC<ShelfRowProps> = ({ shelf, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{shelf.name}</h4>
          {shelf.description && (
            <p className="text-sm text-gray-600 mt-1">{shelf.description}</p>
          )}
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span>Order: {shelf.order}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(shelf)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit shelf"
          >
            <FiEdit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(shelf.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete shelf"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ShelfListProps {
  shelves: Shelf[]
  onAdd: () => void
  onEdit: (shelf: Shelf) => void
  onDelete: (id: number) => void
}

export const ShelfList: React.FC<ShelfListProps> = ({ shelves, onAdd, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Shelves</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={16} />
          Add Shelf
        </button>
      </div>
      
      {shelves.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No shelves in this bookshelf</p>
      ) : (
        <div className="space-y-3">
          {shelves.map((shelf) => (
            <ShelfRow
              key={shelf.id}
              shelf={shelf}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
