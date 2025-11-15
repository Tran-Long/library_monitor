import React, { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import { DraggableLibraryCard } from '@/components/draggable'
import type { Library, Bookshelf, Shelf, Book } from '@/types'

interface DetailPopup {
  type: 'library' | 'bookshelf' | 'shelf' | 'book'
  data: Library | Bookshelf | Shelf | Book
}

interface LibrariesViewProps {
  libraries: Library[]
  allBookshelves: Bookshelf[]
  allShelves: Shelf[]
  books: Book[]
  selectedLibrary: Library | null
  selectedBookshelf: Bookshelf | null
  expandedBookshelves: Set<number>
  error: string | null
  isSubmitting: boolean
  sensors: any
  libraryFormData: {
    name: string
    description?: string
    short_description?: string
    long_description?: string
    address?: string
    phone?: string
    email?: string
  }
  editingLibrary: Library | null
  detailPopup: DetailPopup | null
  shelfDetailPopup: Shelf | null
  showCreateLibraryModal: boolean
  showNavPane: boolean
  onBackClick: () => void
  onToggleNavPane: () => void
  onCreateLibraryClick: () => void
  onSelectLibrary: (library: Library) => Promise<void>
  onSelectBookshelf: (bookshelf: Bookshelf) => Promise<void>
  onToggleBookshelfExpansion: (id: number) => void
  onEditLibrary: (library: Library) => void
  onDeleteLibrary: (libraryId: number) => Promise<void>
  onSetDetailPopup: (popup: DetailPopup | null) => void
  onSetShelfDetailPopup: (shelf: Shelf | null) => void
  onLibraryDragEnd: (event: any) => Promise<void>
}

export function LibrariesView({
  libraries,
  allBookshelves,
  allShelves,
  books,
  selectedLibrary,
  selectedBookshelf,
  expandedBookshelves,
  error,
  isSubmitting,
  sensors,
  libraryFormData,
  editingLibrary,
  detailPopup,
  shelfDetailPopup,
  showCreateLibraryModal,
  showNavPane,
  onBackClick,
  onToggleNavPane,
  onCreateLibraryClick,
  onSelectLibrary,
  onSelectBookshelf,
  onToggleBookshelfExpansion,
  onEditLibrary,
  onDeleteLibrary,
  onSetDetailPopup,
  onSetShelfDetailPopup,
  onLibraryDragEnd,
}: LibrariesViewProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleNavPane}
              className="text-gray-600 hover:text-gray-800 p-1"
              title={showNavPane ? "Hide navigation" : "Show navigation"}
            >
              {showNavPane ? "☰" : "►"}
            </button>
            <button
              onClick={onBackClick}
              className="text-blue-600 hover:text-blue-700 font-medium"
              title="Go back to dashboard"
            >
              🏠
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Pane */}
        {showNavPane && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-2">
                {libraries.length === 0 ? (
                  <p className="text-xs text-gray-500 px-2 py-1">No libraries</p>
                ) : (
                  <div className="space-y-1">
                    {libraries.map((library) => {
                      const libraryBookshelves = allBookshelves
                        .filter(bs => bs.library_id === library.id)
                        .sort((a, b) => a.order - b.order)
                      const isExpanded = expandedBookshelves.has(library.id)
                      return (
                        <div key={library.id}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onToggleBookshelfExpansion(library.id)}
                              className="w-6 text-center px-1 py-1 text-gray-600 hover:bg-gray-200 rounded transition"
                              title="Toggle dropdown"
                            >
                              {isExpanded ? "▼" : "▶"}
                            </button>
                            <button
                              onClick={async () => {
                                await onSelectLibrary(library)
                              }}
                              className={`flex-1 flex items-center gap-2 px-2 py-1 text-sm rounded transition text-left ${
                                selectedLibrary?.id === library.id
                                  ? 'bg-blue-100 text-blue-900 font-semibold'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <img src="/library.png" alt="Library" className="w-4 h-4" />
                              <span>{library.name}</span>
                            </button>
                          </div>

                          {/* Bookshelves under this Library */}
                          {isExpanded && libraryBookshelves.length > 0 && (
                            <div className="ml-4 space-y-1">
                              {libraryBookshelves.map((bookshelf) => {
                                const bookshelfShelves = allShelves.filter(s => s.bookshelf_id === bookshelf.id)
                                const isBookshelfExpanded = expandedBookshelves.has(bookshelf.id)
                                return (
                                  <div key={bookshelf.id}>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => onToggleBookshelfExpansion(bookshelf.id)}
                                        className="w-6 text-center px-1 py-1 text-gray-600 hover:bg-gray-200 rounded transition"
                                        title="Toggle dropdown"
                                      >
                                        {isBookshelfExpanded ? "▼" : "▶"}
                                      </button>
                                      <button
                                        onClick={async () => {
                                          // Skip setting selectedLibrary here - it's already set when clicking library
                                          await onSelectBookshelf(bookshelf)
                                        }}
                                        className={`flex-1 flex items-center gap-2 px-2 py-1 text-xs rounded transition text-left ${
                                          selectedBookshelf?.id === bookshelf.id
                                            ? 'bg-green-100 text-green-900 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                      >
                                        <img src="/bookshelf.png" alt="Bookshelf" className="w-4 h-4" />
                                        <span>{bookshelf.name}</span>
                                      </button>
                                    </div>

                                    {/* Shelves under this Bookshelf */}
                                    {isBookshelfExpanded && bookshelfShelves.length > 0 && (
                                      <div className="ml-4 space-y-1">
                                        {bookshelfShelves.map((shelf) => (
                                          <button
                                            key={shelf.id}
                                            onClick={async () => {
                                              onSetShelfDetailPopup(shelf)
                                            }}
                                            className="w-full flex items-center gap-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition text-left"
                                          >
                                            <img src="/shelf.png" alt="Shelf" className="w-4 h-4" />
                                            <span>{shelf.name || `#${shelf.order}`}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {isBookshelfExpanded && bookshelfShelves.length === 0 && (
                                      <div className="ml-4 px-2 py-1 text-xs text-gray-500">
                                        No shelves
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          {isExpanded && libraryBookshelves.length === 0 && (
                            <div className="ml-4 px-2 py-1 text-xs text-gray-500">
                              No bookshelves
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Libraries ({libraries.length})</h2>
              <button
                onClick={onCreateLibraryClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Add Library
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}

            {libraries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No libraries yet. Create one to get started!</p>
                <button
                  onClick={onCreateLibraryClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
                >
                  ➕ Create First Library
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onLibraryDragEnd}
              >
                <SortableContext
                  items={libraries.map(l => l.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {libraries.map((library) => {
                      const libraryShelves = allShelves.filter(s => {
                        const bookshelf = allBookshelves.find(bs => bs.id === s.bookshelf_id)
                        return bookshelf && bookshelf.library_id === library.id
                      })
                      const libraryBookCount = books.filter(b => libraryShelves.some(s => s.id === b.shelf_id) && b.status !== 'borrowed').length
                      return (
                        <DraggableLibraryCard
                          key={library.id}
                          library={library}
                          bookCount={libraryBookCount}
                          onSelect={() => onSelectLibrary(library)}
                          onEdit={() => onEditLibrary(library)}
                          onDelete={() => onDeleteLibrary(library.id)}
                          onInfo={() => onSetDetailPopup({ type: 'library', data: library })}
                        />
                      )
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </main>
      </div>

      {/* Detail Popup Modal for Libraries View */}
      {detailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {detailPopup.type === 'library' && <><img src="/library.png" alt="Library" className="w-6 h-6" /> <span>Library Details</span></>}
                {detailPopup.type === 'bookshelf' && <><img src="/bookshelf.png" alt="Bookshelf" className="w-6 h-6" /> <span>Bookshelf Details</span></>}
                {detailPopup.type === 'shelf' && <><img src="/shelf.png" alt="Shelf" className="w-6 h-6" /> <span>Shelf Details</span></>}
                {detailPopup.type === 'book' && <>📚 <span>Book Details</span></>}
              </h2>
              <button
                onClick={() => onSetDetailPopup(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Name</h3>
                <p className="text-gray-600 mt-1">
                  {detailPopup.type === 'library' && (detailPopup.data as Library).name}
                  {detailPopup.type === 'bookshelf' && (detailPopup.data as Bookshelf).name}
                  {detailPopup.type === 'shelf' && ((detailPopup.data as Shelf).name || '(No name)')}
                  {detailPopup.type === 'book' && (detailPopup.data as Book).title}
                </p>
              </div>
              {detailPopup.type === 'library' && (
                <>
                  {(detailPopup.data as Library).address && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Address</h3>
                      <p className="text-gray-600 mt-1">{(detailPopup.data as Library).address}</p>
                    </div>
                  )}
                  {(detailPopup.data as Library).phone && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Phone</h3>
                      <p className="text-gray-600 mt-1">{(detailPopup.data as Library).phone}</p>
                    </div>
                  )}
                  {(detailPopup.data as Library).email && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Email</h3>
                      <p className="text-gray-600 mt-1">{(detailPopup.data as Library).email}</p>
                    </div>
                  )}
                </>
              )}
              {detailPopup.type === 'book' && (
                <>
                  {((detailPopup.data as Book).author || (detailPopup.data as Book).year) && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Author & Year</h3>
                      <p className="text-gray-600 mt-1">
                        {(detailPopup.data as Book).author && <span>{(detailPopup.data as Book).author}</span>}
                        {(detailPopup.data as Book).year && <span> ({(detailPopup.data as Book).year})</span>}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div>
                <h3 className="font-semibold text-gray-700">Short Description</h3>
                <p className="text-gray-600 mt-1">
                  {detailPopup.type === 'library' && ((detailPopup.data as Library).short_description || '(None)')}
                  {detailPopup.type === 'bookshelf' && ((detailPopup.data as Bookshelf).short_description || '(None)')}
                  {detailPopup.type === 'shelf' && ((detailPopup.data as Shelf).short_description || '(None)')}
                  {detailPopup.type === 'book' && ((detailPopup.data as Book).short_description || '(None)')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Long Description</h3>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                  {detailPopup.type === 'library' && ((detailPopup.data as Library).long_description || '(None)')}
                  {detailPopup.type === 'bookshelf' && ((detailPopup.data as Bookshelf).long_description || '(None)')}
                  {detailPopup.type === 'shelf' && ((detailPopup.data as Shelf).long_description || '(None)')}
                  {detailPopup.type === 'book' && ((detailPopup.data as Book).long_description || '(None)')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => onSetDetailPopup(null)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
