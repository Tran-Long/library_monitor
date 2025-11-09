import React from 'react'
import { FiBook, FiPlus, FiEdit2, FiTrash2, FiGripVertical } from 'react-icons/fi'
import type { Library } from '../types'

interface LibraryCardProps {
  library: Library
  onEdit: (library: Library) => void
  onDelete: (id: number) => void
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ library, onEdit, onDelete }) => {
  return (
    <div
      draggable
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-3xl text-blue-500 mt-1">
            <FiBook />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800">{library.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{library.description}</p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Address:</span> {library.address}
              </p>
              {library.phone && (
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span> {library.phone}
                </p>
              )}
              {library.email && (
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {library.email}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(library)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit library"
          >
            <FiEdit2 size={20} />
          </button>
          <button
            onClick={() => onDelete(library.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete library"
          >
            <FiTrash2 size={20} />
          </button>
          <div className="p-2 text-gray-400 cursor-grab active:cursor-grabbing">
            <FiGripVertical size={20} />
          </div>
        </div>
      </div>
    </div>
  )
}

interface LibraryGridProps {
  libraries: Library[]
  onAdd: () => void
  onEdit: (library: Library) => void
  onDelete: (id: number) => void
}

export const LibraryGrid: React.FC<LibraryGridProps> = ({ libraries, onAdd, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Libraries</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={20} />
          Add Library
        </button>
      </div>
      {libraries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiBook className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500">No libraries yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {libraries.map((library) => (
            <LibraryCard
              key={library.id}
              library={library}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
