import '@/styles/globals.css'
import React, { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Library, Bookshelf, Shelf, Book, User } from '@/types'
import Dashboard from '@/components/Dashboard'
import DashboardClickable from '@/components/DashboardClickable'

// Draggable Library Card Component
function DraggableLibraryCard({ library, bookCount, onSelect, onEdit, onDelete, onInfo }: { library: Library; bookCount: number; onSelect: () => void; onEdit: () => void; onDelete: () => void; onInfo: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: library.id })

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
        <div 
          className="flex-1 cursor-pointer"
          onClick={onSelect}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">📚 {bookCount}</span>
            <div className="flex items-center gap-2">
              <img src="/library.png" alt="Library" className="w-5 h-5" />
              <h3 className="text-xl font-semibold text-gray-800">{library.name}</h3>
            </div>
          </div>
          {library.short_description && (
            <p className="text-gray-600 text-sm mt-1">{library.short_description}</p>
          )}
          <div className="mt-4 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-2">
            {library.address && <p><strong>📍</strong> {library.address}</p>}
            {library.phone && <p><strong>📞</strong> {library.phone}</p>}
            {library.email && <p><strong>📧</strong> {library.email}</p>}
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

// Draggable Bookshelf Card Component
function DraggableBookshelfCard({ bookshelf, bookCount, onEdit, onDelete, onSelect, onInfo }: { bookshelf: Bookshelf; bookCount: number; onEdit: () => void; onDelete: () => void; onSelect: () => void; onInfo: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookshelf.id })

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
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">📚 {bookCount}</span>
            <div className="flex items-center gap-2">
              <img src="/bookshelf.png" alt="Bookshelf" className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">{bookshelf.name}</h3>
            </div>
          </div>
          {bookshelf.short_description && (
            <p className="text-gray-600 text-sm mt-1">{bookshelf.short_description}</p>
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

// Draggable Shelf Card Component
function DraggableShelfCard({ shelf, books, onShelfClick, onAddBook, onDeleteShelf, onMoveBook }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shelf.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style as any}
      className={`relative pb-6 ${isDragging ? 'scale-95 opacity-50' : ''}`}
    >
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
              <img src="/shelf.png" alt="Shelf" className="w-4 h-4" /> #{shelf.order}{shelf.name ? `: ${shelf.name}` : ''} • 📚 Books: {books.length}
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

export default function App() {
  // Main states
  const [libraries, setLibraries] = useState<Library[]>([])
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null)
  const [bookshelves, setBookshelves] = useState<Bookshelf[]>([])
  const [allBookshelves, setAllBookshelves] = useState<Bookshelf[]>([])
  const [selectedBookshelf, setSelectedBookshelf] = useState<Bookshelf | null>(null)
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [allShelves, setAllShelves] = useState<Shelf[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [storageBooks, setStorageBooks] = useState<Book[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [shelfDetailPopup, setShelfDetailPopup] = useState<Shelf | null>(null)
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'libraries' | 'storage' | 'borrowed' | 'manage-books' | 'manage-users'>('dashboard')
  
  // Modal states
  const [showCreateLibraryModal, setShowCreateLibraryModal] = useState(false)
  const [showCreateBookshelfModal, setShowCreateBookshelfModal] = useState(false)
  const [showCreateShelfModal, setShowCreateShelfModal] = useState(false)
  const [showCreateBookModal, setShowCreateBookModal] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showStorageModal, setShowStorageModal] = useState(false)
  const [showSelectStorageBooksModal, setShowSelectStorageBooksModal] = useState(false)
  const [selectedShelfForAddingBooks, setSelectedShelfForAddingBooks] = useState<Shelf | null>(null)
  const [selectedShelfForBook, setSelectedShelfForBook] = useState<Shelf | null>(null)
  const [editingLibrary, setEditingLibrary] = useState<Library | null>(null)
  const [editingBookshelf, setEditingBookshelf] = useState<Bookshelf | null>(null)
  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [detailPopup, setDetailPopup] = useState<{ type: 'library' | 'bookshelf' | 'shelf' | 'book'; data: Library | Bookshelf | Shelf | Book } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedLibraryForBook, setSelectedLibraryForBook] = useState<string>('')
  const [selectedBookshelfForBook, setSelectedBookshelfForBook] = useState<string>('')
  const [selectedShelfIdForBook, setSelectedShelfIdForBook] = useState<string>('')
  const [placementType, setPlacementType] = useState<'storage' | 'shelf'>('storage')
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [bookToBorrow, setBookToBorrow] = useState<Book | null>(null)
  const [showMoveBookModal, setShowMoveBookModal] = useState(false)
  const [bookToMove, setBookToMove] = useState<Book | null>(null)
  const [selectedShelfForMove, setSelectedShelfForMove] = useState<Shelf | null>(null)
  const [selectedUserForBorrow, setSelectedUserForBorrow] = useState<string>('')
  const [showNavPane, setShowNavPaneState] = useState(() => {
    // Initialize from localStorage, default to true
    try {
      const saved = localStorage.getItem('showNavPane')
      return saved !== null ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })
  const [expandedBookshelves, setExpandedBookshelves] = useState<Set<number>>(new Set())
  
  // Wrapper to persist nav pane state to localStorage
  const setShowNavPane = (value: boolean | ((prev: boolean) => boolean)) => {
    setShowNavPaneState((prev: boolean) => {
      const newValue = typeof value === 'function' ? (value as (prev: boolean) => boolean)(prev) : value
      localStorage.setItem('showNavPane', JSON.stringify(newValue))
      return newValue
    })
  }
  

  // Form states
  const [libraryFormData, setLibraryFormData] = useState({
    name: '',
    short_description: '',
    long_description: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  })
  const [bookshelfFormData, setBookshelfFormData] = useState({
    name: '',
    short_description: '',
    long_description: '',
    description: ''
  })
  const [shelfFormData, setShelfFormData] = useState({
    name: '',
    short_description: '',
    long_description: '',
    description: ''
  })
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    year: '',
    short_description: '',
    long_description: '',
    targetShelf: '' // 'storage', 'library:{id}', 'bookshelf:{id}', 'shelf:{id}'
  })
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    dob: '',
    phone: '',
    short_description: '',
    long_description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Variable to hold the main content that will be rendered at the bottom
  let mainContent: React.ReactNode = null

  // Helper function to update URL
  const updateUrl = (tab: string, libraryId?: number, bookshelfId?: number) => {
    let path = '/'
    if (tab !== 'dashboard') {
      path = `/${tab}`
      if (libraryId) path += `/${libraryId}`
      if (bookshelfId) path += `/${bookshelfId}`
    }
    window.history.pushState({
      tab,
      libraryId,
      bookshelfId,
    }, '', path)
  }

  // Initial load and history listener
  useEffect(() => {
    const loadInitialData = async () => {
      await loadLibraries()
      await loadAllBooks()
      await loadUsers()
    }
    loadInitialData()
  }, [])

  // Restore state from URL after data loads
  useEffect(() => {
    if (libraries.length > 0) {
      const restoreFromUrl = async () => {
        const path = window.location.pathname
        const parts = path.split('/').filter(p => p)

        if (parts.length === 0) {
          // Root path - dashboard
          setActiveMainTab('dashboard')
          setSelectedLibrary(null)
          setSelectedBookshelf(null)
          return
        }

        const tab = parts[0] as 'dashboard' | 'libraries' | 'storage' | 'borrowed' | 'manage-books' | 'manage-users'
        const libraryId = parts[1] ? parseInt(parts[1]) : undefined
        const bookshelfId = parts[2] ? parseInt(parts[2]) : undefined

        setActiveMainTab(tab)

        // Restore library if needed
        if (tab === 'libraries') {
          if (libraryId) {
            const lib = libraries.find((l: Library) => l.id === libraryId)
            if (lib) {
              setSelectedLibrary(lib)
              // Expand the library in the nav tree
              setExpandedBookshelves((prev: Set<number>) => {
                const newExpanded = new Set(prev)
                newExpanded.add(libraryId)
                return newExpanded
              })
              // Load bookshelves for this library
              try {
                const response = await fetch(`/api/libraries/${libraryId}/bookshelves/`)
                if (response.ok) {
                  const bsData = await response.json()
                  setBookshelves(bsData)
                  
                  // Restore bookshelf if needed
                  if (bookshelfId) {
                    const bs = bsData.find((b: Bookshelf) => b.id === bookshelfId)
                    if (bs) {
                      setSelectedBookshelf(bs)
                      // Expand the bookshelf in the nav tree
                      setExpandedBookshelves((prev: Set<number>) => {
                        const newExpanded = new Set(prev)
                        newExpanded.add(bookshelfId)
                        return newExpanded
                      })
                      // Load shelves for this bookshelf
                      const shResponse = await fetch(`/api/bookshelves/${bookshelfId}/shelves/`)
                      if (shResponse.ok) {
                        const shData = await shResponse.json()
                        setShelves(shData)
                      }
                    } else {
                      // Bookshelf ID in URL but not found, clear selection
                      setSelectedBookshelf(null)
                      setShelves([])
                    }
                  } else {
                    // No bookshelf ID in URL, clear selection
                    setSelectedBookshelf(null)
                    setShelves([])
                  }
                }
              } catch (err) {
                console.error('Failed to restore bookshelves/shelves:', err)
              }
            }
          } else {
            // No library selected in libraries view
            setSelectedLibrary(null)
            setSelectedBookshelf(null)
            setBookshelves([])
            setShelves([])
          }
        }
      }
      restoreFromUrl()
    }
  }, [libraries])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = async () => {
      const path = window.location.pathname
      const parts = path.split('/').filter(p => p)

      if (parts.length === 0) {
        // Root path - dashboard
        setActiveMainTab('dashboard')
        setSelectedLibrary(null)
        setSelectedBookshelf(null)
        return
      }

      const tab = parts[0] as 'dashboard' | 'libraries' | 'storage' | 'borrowed' | 'manage-books' | 'manage-users'
      const libraryId = parts[1] ? parseInt(parts[1]) : undefined
      const bookshelfId = parts[2] ? parseInt(parts[2]) : undefined

      setActiveMainTab(tab)

      // Restore library if needed
      if (tab === 'libraries') {
        if (libraryId && libraries.length > 0) {
          const lib = libraries.find((l: Library) => l.id === libraryId)
          if (lib) {
            setSelectedLibrary(lib)
            // Expand the library in the nav tree
            setExpandedBookshelves((prev: Set<number>) => {
              const newExpanded = new Set(prev)
              newExpanded.add(libraryId)
              return newExpanded
            })
            // Load bookshelves for this library
            try {
              const response = await fetch(`/api/libraries/${libraryId}/bookshelves/`)
              if (response.ok) {
                const bsData = await response.json()
                setBookshelves(bsData)
                
                // Restore bookshelf if needed
                if (bookshelfId) {
                  const bs = bsData.find((b: Bookshelf) => b.id === bookshelfId)
                  if (bs) {
                    setSelectedBookshelf(bs)
                    // Expand the bookshelf in the nav tree
                    setExpandedBookshelves((prev: Set<number>) => {
                      const newExpanded = new Set(prev)
                      newExpanded.add(bookshelfId)
                      return newExpanded
                    })
                    // Load shelves for this bookshelf
                    const shResponse = await fetch(`/api/bookshelves/${bookshelfId}/shelves/`)
                    if (shResponse.ok) {
                      const shData = await shResponse.json()
                      setShelves(shData)
                    }
                  } else {
                    // Bookshelf ID in URL but not found, clear selection
                    setSelectedBookshelf(null)
                    setShelves([])
                  }
                } else {
                  // No bookshelf ID in URL, clear selection
                  setSelectedBookshelf(null)
                  setShelves([])
                }
              }
            } catch (err) {
              console.error('Failed to restore bookshelves/shelves:', err)
            }
          }
        } else {
          // No library selected in libraries view
          setSelectedLibrary(null)
          setSelectedBookshelf(null)
          setBookshelves([])
          setShelves([])
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [libraries])

  // ============= LIBRARIES =============
  const loadLibraries = async () => {
    try {
      const response = await fetch('/api/libraries/')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      // Sort by order field to preserve drag-and-drop order
      const sortedData = data.sort((a: Library, b: Library) => (a.order || 0) - (b.order || 0))
      setLibraries(sortedData)
      
      // Load all bookshelves for the modal dropdown
      try {
        const allBs: Bookshelf[] = []
        const allSh: Shelf[] = []
        for (const lib of sortedData) {
          const bsResponse = await fetch(`/api/libraries/${lib.id}/bookshelves/`)
          if (bsResponse.ok) {
            const bsData = await bsResponse.json()
            allBs.push(...bsData)
            
            // Load all shelves for each bookshelf
            for (const bs of bsData) {
              const shResponse = await fetch(`/api/bookshelves/${bs.id}/shelves/`)
              if (shResponse.ok) {
                const shData = await shResponse.json()
                allSh.push(...shData)
              }
            }
          }
        }
        setAllBookshelves(allBs)
        setAllShelves(allSh)
      } catch (err) {
        console.error('Failed to load all bookshelves/shelves:', err)
      }
      
      setError(null)
    } catch (err) {
      setError(`Failed to load libraries: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error(err)
    }
  }

  const loadAllBooks = async () => {
    try {
      const response = await fetch('/api/books/')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setBooks(data)
    } catch (err) {
      console.error('Failed to load books:', err)
    }
  }

  const handleCreateLibrary = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/libraries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(libraryFormData)
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      setLibraryFormData({ name: '', description: '', address: '', phone: '', email: '' })
      setShowCreateLibraryModal(false)
      await loadLibraries()
    } catch (err) {
      setError(`Failed to create library: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLibrary = async (id: number) => {
    if (!window.confirm('Delete this library? This action cannot be undone.')) return
    try {
      const response = await fetch(`/api/libraries/${id}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      setSelectedLibrary(null)
      await loadLibraries()
    } catch (err) {
      setError(`Failed to delete library: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleUpdateLibrary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLibrary) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/libraries/${editingLibrary.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(libraryFormData)
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      setLibraryFormData({ name: '', description: '', address: '', phone: '', email: '', short_description: '', long_description: '' })
      setEditingLibrary(null)
      setShowCreateLibraryModal(false)
      await loadLibraries()
    } catch (err) {
      setError(`Failed to update library: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditLibraryModal = (library: Library) => {
    setEditingLibrary(library)
    setLibraryFormData({ 
      name: library.name, 
      description: library.description,
      short_description: library.short_description || '',
      long_description: library.long_description || '',
      address: library.address || '',
      phone: library.phone || '',
      email: library.email || ''
    })
    setShowCreateLibraryModal(true)
  }

  // ============= BOOKSHELVES =============
  const loadBookshelves = async (libraryId: number) => {
    try {
      const response = await fetch(`/api/libraries/${libraryId}/bookshelves/`)
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setBookshelves(data)
    } catch (err) {
      setError(`Failed to load bookshelves: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error(err)
    }
  }

  const handleSelectLibrary = async (library: Library) => {
    setSelectedLibrary(library)
    setSelectedBookshelf(null)
    // Expand the library in the navigation tree
    setExpandedBookshelves((prev: Set<number>) => {
      const newExpanded = new Set(prev)
      newExpanded.add(library.id)
      return newExpanded
    })
    updateUrl('libraries', library.id)
    await loadBookshelves(library.id)
  }

  const handleCreateBookshelf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLibrary) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/libraries/${selectedLibrary.id}/bookshelves/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookshelfFormData,
          library_id: selectedLibrary.id
        })
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      setBookshelfFormData({ name: '', description: '' })
      setShowCreateBookshelfModal(false)
      await loadBookshelves(selectedLibrary.id)
      // Reload all bookshelves for navigation pane
      const allBsResponse = await fetch('/api/bookshelves/')
      if (allBsResponse.ok) {
        const allBsData = await allBsResponse.json()
        setAllBookshelves(allBsData)
      }
    } catch (err) {
      setError(`Failed to create bookshelf: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateBookshelf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLibrary || !editingBookshelf) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/bookshelves/${editingBookshelf.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookshelfFormData)
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      setBookshelfFormData({ name: '', description: '', short_description: '', long_description: '' })
      setEditingBookshelf(null)
      setShowCreateBookshelfModal(false)
      await loadBookshelves(selectedLibrary.id)
      // Reload all bookshelves for navigation pane
      const allBsResponse = await fetch('/api/bookshelves/')
      if (allBsResponse.ok) {
        const allBsData = await allBsResponse.json()
        setAllBookshelves(allBsData)
      }
    } catch (err) {
      setError(`Failed to update bookshelf: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBookshelf = async (id: number) => {
    if (!window.confirm('Delete this bookshelf? This action cannot be undone.')) return
    if (!selectedLibrary) return
    try {
      const response = await fetch(`/api/bookshelves/${id}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      await loadBookshelves(selectedLibrary.id)
      // Reload all bookshelves for navigation pane
      const allBsResponse = await fetch('/api/bookshelves/')
      if (allBsResponse.ok) {
        const allBsData = await allBsResponse.json()
        setAllBookshelves(allBsData)
      }
    } catch (err) {
      setError(`Failed to delete bookshelf: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const openEditBookshelfModal = (bookshelf: Bookshelf) => {
    setEditingBookshelf(bookshelf)
    setBookshelfFormData({ 
      name: bookshelf.name, 
      description: bookshelf.description,
      short_description: bookshelf.short_description || '',
      long_description: bookshelf.long_description || ''
    })
    setShowCreateBookshelfModal(true)
  }

  // ============= SHELVES =============
  const loadShelves = async (bookshelfId: number) => {
    try {
      const response = await fetch(`/api/bookshelves/${bookshelfId}/shelves/`)
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setShelves(data)
    } catch (err) {
      setError(`Failed to load shelves: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error(err)
    }
  }

  const handleSelectBookshelf = async (bookshelf: Bookshelf) => {
    setSelectedBookshelf(bookshelf)
    if (selectedLibrary) {
      // Expand both the library and bookshelf in the tree
      setExpandedBookshelves((prev: Set<number>) => {
        const newExpanded = new Set(prev)
        newExpanded.add(selectedLibrary.id)
        newExpanded.add(bookshelf.id)
        return newExpanded
      })
      updateUrl('libraries', selectedLibrary.id, bookshelf.id)
    }
    await loadShelves(bookshelf.id)
  }

  const handleCreateShelf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookshelf) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/bookshelves/${selectedBookshelf.id}/shelves/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shelfFormData)
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      setShelfFormData({ name: '', description: '', short_description: '', long_description: '' })
      setShowCreateShelfModal(false)
      await loadShelves(selectedBookshelf.id)
      // Reload all shelves for navigation pane
      const allShResponse = await fetch('/api/shelves/')
      if (allShResponse.ok) {
        const allShData = await allShResponse.json()
        setAllShelves(allShData)
      }
    } catch (err) {
      setError(`Failed to create shelf: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteShelf = async (id: number) => {
    if (!window.confirm('Delete this shelf? Books on this shelf will need to be relocated.')) return
    try {
      const response = await fetch(`/api/shelves/${id}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      if (selectedBookshelf) {
        // Reload and reindex remaining shelves
        const remainingShelves = shelves.filter((s: any) => s.id !== id)
        // Reorder all remaining shelves
        const reorderPayload = remainingShelves.map((shelf: any, idx: number) => ({
          id: shelf.id,
          order: idx
        }))
        if (reorderPayload.length > 0) {
          await fetch(`/api/shelves/reorder/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reorderPayload)
          })
        }
        // Reload to get updated order values from backend
        await loadShelves(selectedBookshelf.id)
        // Reload all shelves for navigation pane
        const allShResponse = await fetch('/api/shelves/')
        if (allShResponse.ok) {
          const allShData = await allShResponse.json()
          setAllShelves(allShData)
        }
      }
    } catch (err) {
      setError(`Failed to delete shelf: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // ============= BOOKS =============
  const loadBooks = async (shelfId: number) => {
    try {
      const response = await fetch(`/api/books/?shelf_id=${shelfId}`)
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setBooks(data)
    } catch (err) {
      setError(`Failed to load books: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error(err)
    }
  }

  const loadStorageBooks = async () => {
    try {
      const response = await fetch('/api/books/storage/')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setStorageBooks(data)
    } catch (err) {
      setError(`Failed to load storage books: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error(err)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users/')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(`Failed to load users: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error(err)
    }
  }

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!bookFormData.title.trim()) {
        setError('Title is required')
        setIsSubmitting(false)
        return
      }

      const payload = {
        title: bookFormData.title,
        author: bookFormData.author || undefined,
        year: bookFormData.year ? parseInt(bookFormData.year) : undefined,
        short_description: bookFormData.short_description || undefined,
        long_description: bookFormData.long_description || undefined
      }
      
      let response: Response
      
      if (placementType === 'shelf' && selectedShelfIdForBook) {
        // Create book on specific shelf
        response = await fetch(`/api/shelves/${selectedShelfIdForBook}/books/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        // Create book in storage
        response = await fetch('/api/books/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      
      // Reset form
      setBookFormData({ title: '', author: '', year: '', short_description: '', long_description: '', targetShelf: '' })
      setPlacementType('storage')
      setSelectedLibraryForBook('')
      setSelectedBookshelfForBook('')
      setSelectedShelfIdForBook('')
      setShowCreateBookModal(false)
      
      await loadAllBooks()
      await loadStorageBooks()
    } catch (err) {
      setError(`Failed to create book: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBook) return
    setIsSubmitting(true)
    try {
      if (!bookFormData.title.trim()) {
        setError('Title is required')
        setIsSubmitting(false)
        return
      }

      const payload = {
        title: bookFormData.title,
        author: bookFormData.author || undefined,
        year: bookFormData.year ? parseInt(bookFormData.year) : undefined,
        short_description: bookFormData.short_description || undefined,
        long_description: bookFormData.long_description || undefined,
        shelf_id: editingBook.shelf_id || undefined,
        status: editingBook.status || 'storage'
      }

      const response = await fetch(`/api/books/${editingBook.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      setBookFormData({ title: '', author: '', year: '', short_description: '', long_description: '', targetShelf: '' })
      setEditingBook(null)
      setShowCreateBookModal(false)

      await loadAllBooks()
      await loadStorageBooks()
      setError(null)
    } catch (err) {
      setError(`Failed to update book: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!userFormData.full_name.trim()) {
        setError('Full name is required')
        setIsSubmitting(false)
        return
      }

      const payload = {
        full_name: userFormData.full_name,
        dob: userFormData.dob || null,
        phone: userFormData.phone || null,
        short_description: userFormData.short_description || '',
        long_description: userFormData.long_description || ''
      }

      const response = await fetch('/api/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      // Reset form
      setUserFormData({ full_name: '', dob: '', phone: '', short_description: '', long_description: '' })
      setEditingUser(null)
      setShowCreateUserModal(false)

      // Reload users list
      await loadUsers()
      setError(null)
    } catch (err) {
      setError(`Failed to create user: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsSubmitting(true)
    try {
      if (!userFormData.full_name.trim()) {
        setError('Full name is required')
        setIsSubmitting(false)
        return
      }

      const payload = {
        full_name: userFormData.full_name,
        dob: userFormData.dob || null,
        phone: userFormData.phone || null,
        short_description: userFormData.short_description || '',
        long_description: userFormData.long_description || ''
      }

      const response = await fetch(`/api/users/${editingUser.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      // Reset form
      setUserFormData({ full_name: '', dob: '', phone: '', short_description: '', long_description: '' })
      setEditingUser(null)
      setShowCreateUserModal(false)

      // Reload users list
      await loadUsers()
      setError(null)
    } catch (err) {
      setError(`Failed to update user: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Delete this user?')) return
    try {
      const response = await fetch(`/api/users/${userId}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      await loadUsers()
      setError(null)
    } catch (err) {
      setError(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDeleteBook = async (bookId: number, shelfId: number | null) => {
    if (!window.confirm('Delete this book?')) return
    try {
      const response = await fetch(`/api/books/${bookId}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      await loadAllBooks()
      await loadStorageBooks()
    } catch (err) {
      setError(`Failed to delete book: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleMoveBook = async (bookId: number, newShelfId: number | null, newStatus: string = 'storage') => {
    try {
      const payload = { 
        shelf_id: newShelfId,
        status: newShelfId ? 'library' : newStatus
      }
      const response = await fetch(`/api/books/${bookId}/move/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      await loadAllBooks()
      await loadStorageBooks()
      if (selectedBookshelf) {
        await loadShelves(selectedBookshelf.id)
      }
    } catch (err) {
      setError(`Failed to move book: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleBorrowBook = async (bookId: number, userId: number) => {
    try {
      const response = await fetch(`/api/books/${bookId}/borrow/${userId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      await loadAllBooks()
      if (selectedBookshelf) {
        await loadShelves(selectedBookshelf.id)
      }
      setShowBorrowModal(false)
      setBookToBorrow(null)
      setSelectedUserForBorrow('')
    } catch (err) {
      setError(`Failed to borrow book: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleReturnBook = async (bookId: number) => {
    if (!window.confirm('Return this book to storage?')) return
    try {
      const response = await fetch(`/api/books/${bookId}/return/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      await loadAllBooks()
      await loadStorageBooks()
    } catch (err) {
      setError(`Failed to return book: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // ============= DRAG & DROP =============
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleLibraryDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = libraries.findIndex((lib) => lib.id === active.id)
    const newIndex = libraries.findIndex((lib) => lib.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newLibraries = arrayMove(libraries, oldIndex, newIndex)
    setLibraries(newLibraries)

    // Update backend with new order for all libraries using the reorder endpoint
    try {
      const reorderPayload = newLibraries.map((library: Library, idx: number) => ({
        id: library.id,
        order: idx
      }))
      
      // Use the reorder endpoint to update all libraries at once atomically
      const response = await fetch('/api/libraries/reorder/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderPayload)
      })
      
      if (!response.ok) {
        throw new Error(`Reorder failed: ${response.status}`)
      }
      
      // Reload libraries to ensure state matches backend
      await loadLibraries()
    } catch (err) {
      console.error('Failed to update library order:', err)
      await loadLibraries()
    }
  }

  const handleBookshelfDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = bookshelves.findIndex((shelf) => shelf.id === active.id)
    const newIndex = bookshelves.findIndex((shelf) => shelf.id === over.id)

    if (oldIndex === -1 || newIndex === -1 || !selectedLibrary) return

    const newBookshelves = arrayMove(bookshelves, oldIndex, newIndex)
    setBookshelves(newBookshelves)

    // Update backend with new order for all bookshelves
    try {
      const reorderPayload = newBookshelves.map((bookshelf: any, idx: number) => ({
        id: bookshelf.id,
        order: idx
      }))
      await fetch(`/api/bookshelves/reorder/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderPayload)
      })
      // Reload all bookshelves for navigation pane
      const allBsResponse = await fetch('/api/bookshelves/')
      if (allBsResponse.ok) {
        const allBsData = await allBsResponse.json()
        setAllBookshelves(allBsData)
      }
    } catch (err) {
      console.error('Failed to update bookshelf order:', err)
      await loadBookshelves(selectedLibrary.id)
    }
  }

  const handleShelfDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = shelves.findIndex((shelf: any) => shelf.id === active.id)
    const newIndex = shelves.findIndex((shelf: any) => shelf.id === over.id)

    if (oldIndex === -1 || newIndex === -1 || !selectedBookshelf) return

    const newShelves = arrayMove(shelves, oldIndex, newIndex)
    setShelves(newShelves)

    // Update backend with new order for all shelves
    try {
      const reorderPayload = newShelves.map((shelf: any, idx: number) => ({
        id: shelf.id,
        order: idx
      }))
      await fetch(`/api/shelves/reorder/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderPayload)
      })
      // Reload to get updated order values from backend
      await loadShelves(selectedBookshelf.id)
      // Reload all shelves for navigation pane with sorting
      const allShResponse = await fetch('/api/shelves/')
      if (allShResponse.ok) {
        const allShData = await allShResponse.json()
        const sorted = allShData.sort((a: any, b: any) => {
          if (a.bookshelf_id !== b.bookshelf_id) return a.bookshelf_id - b.bookshelf_id
          return a.order - b.order
        })
        setAllShelves(sorted)
      }
    } catch (err) {
      console.error('Failed to update shelf order:', err)
      await loadShelves(selectedBookshelf.id)
    }
  }

  // ============= RENDER =============
  if (selectedBookshelf && selectedLibrary) {
    // BOOKSHELF DETAIL VIEW - Show shelves
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowNavPane(!showNavPane)}
                  className="text-gray-600 hover:text-gray-800 p-1"
                  title={showNavPane ? "Hide navigation" : "Show navigation"}
                >
                  {showNavPane ? "☰" : "►"}
                </button>
                <button
                  onClick={() => {
                    setSelectedLibrary(null)
                    setSelectedBookshelf(null)
                    setExpandedBookshelves(new Set())
                    setActiveMainTab('dashboard')
                    updateUrl('dashboard')
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  title="Go back to dashboard"
                >
                  🏠
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2"><img src="/bookshelf.png" alt="Bookshelf" className="w-8 h-8" /> {selectedBookshelf.name}</h1>
              <div></div>
            </div>
            {selectedBookshelf.description && (
              <p className="text-gray-600 mt-2 text-center">{selectedBookshelf.description}</p>
            )}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Pane */}
          {showNavPane && (
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                {/* <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><img src="/gps-navigation.png" alt="Navigation" className="w-5 h-5" /> Navigation</h3> */}
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
                                onClick={() => {
                                  const newExpanded = new Set(expandedBookshelves)
                                  if (isExpanded) {
                                    newExpanded.delete(library.id)
                                  } else {
                                    newExpanded.add(library.id)
                                  }
                                  setExpandedBookshelves(newExpanded)
                                }}
                                className="w-6 text-center px-1 py-1 text-gray-600 hover:bg-gray-200 rounded transition"
                                title="Toggle dropdown"
                              >
                                {isExpanded ? "▼" : "▶"}
                              </button>
                              <button
                                onClick={async () => {
                                  await handleSelectLibrary(library)
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
                                          onClick={() => {
                                            const newExpanded = new Set(expandedBookshelves)
                                            if (isBookshelfExpanded) {
                                              newExpanded.delete(bookshelf.id)
                                            } else {
                                              newExpanded.add(bookshelf.id)
                                            }
                                            setExpandedBookshelves(newExpanded)
                                          }}
                                          className="w-6 text-center px-1 py-1 text-gray-600 hover:bg-gray-200 rounded transition"
                                          title="Toggle dropdown"
                                        >
                                          {isBookshelfExpanded ? "▼" : "▶"}
                                        </button>
                                        <button
                                          onClick={async () => {
                                            setSelectedLibrary(library)
                                            await handleSelectBookshelf(bookshelf)
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
                                              onClick={() => {
                                                setShelfDetailPopup(shelf)
                                              }}
                                              className="w-full flex items-center gap-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition text-left"
                                            >
                                              <img src="/shelf.png" alt="Shelf" className="w-4 h-4" /><span>{shelf.name || `#${shelf.order}`}</span>
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
            <div className="max-w-7xl mx-auto">{error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Shelves ({shelves.length})</h2>
              <button
                onClick={() => {
                  setEditingShelf(null)
                  setShelfFormData({ name: '', description: '', short_description: '', long_description: '' })
                  setShowCreateShelfModal(true)
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Add Shelf
              </button>
            </div>

            {shelves.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No shelves yet. Create one to get started!</p>
                <button
                  onClick={() => {
                    setEditingShelf(null)
                    setShelfFormData({ name: '', description: '', short_description: '', long_description: '' })
                    setShowCreateShelfModal(true)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
                >
                  ➕ Create First Shelf
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 border-l-8 border-amber-600">
                {/* Visual Bookshelf Representation */}
                <div className="space-y-4">
                  {/* Shelves */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleShelfDragEnd}
                  >
                    <SortableContext
                      items={shelves.map(s => s.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="space-y-4">
                        {shelves.map((shelf) => {
                          const shelfBooks = books.filter(b => b.shelf_id === shelf.id && b.status !== 'borrowed')
                          return (
                            <DraggableShelfCard
                              key={shelf.id}
                              shelf={shelf}
                              books={shelfBooks}
                              onShelfClick={() => {
                                setShelfDetailPopup(shelf)
                              }}
                              onAddBook={() => {
                                setSelectedShelfForAddingBooks(shelf)
                                loadStorageBooks()
                                setShowSelectStorageBooksModal(true)
                              }}
                              onDeleteShelf={() => handleDeleteShelf(shelf.id)}
                              onMoveBook={(bookId) => handleMoveBook(bookId, null)}
                              onDeleteBook={(bookId) => handleDeleteBook(bookId, shelf.id)}
                            />
                          )
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}
          </div>
            </div>
          </main>
        </div>

        {/* Create Shelf Modal */}
        {showCreateShelfModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add New Shelf</h2>
                <button
                  onClick={() => setShowCreateShelfModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateShelf} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Name</label>
                  <input
                    type="text"
                    value={shelfFormData.name}
                    onChange={(e) => setShelfFormData({ ...shelfFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Shelf A (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={shelfFormData.short_description}
                    onChange={(e) => setShelfFormData({ ...shelfFormData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Brief description for the card"
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                  <textarea
                    value={shelfFormData.long_description}
                    onChange={(e) => setShelfFormData({ ...shelfFormData, long_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Detailed description (shown in detail view)"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateShelfModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Shelf'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Storage Modal */}
        {showStorageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto"
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                const bookId = parseInt(e.dataTransfer.getData('bookId'))
                if (bookId) {
                  handleMoveBook(bookId, null)
                }
              }}
            >
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-900">📦 Storage (Books Not on Shelves) - Drag books here</h2>
                <button
                  onClick={() => setShowStorageModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              {storageBooks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No books in storage</p>
              ) : (
                <div className="space-y-3">
                  {storageBooks.map((book) => (
                    <div
                      key={book.id}
                      className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">{book.title}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setBookToBorrow(book)
                              setShowBorrowModal(true)
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-green-600 hover:bg-green-50 transition"
                            title="Lend to user"
                          >
                            📤
                          </button>
                          <button
                            onClick={() => {
                              setBookToMove(book)
                              setShowMoveBookModal(true)
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-orange-600 hover:bg-orange-50 transition"
                            title="Move to shelf"
                          >
                            <img src="/shelf.png" alt="Shelf" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                          <span>{book.author || '-'}</span>
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                          <span>{book.year || '-'}</span>
                        </p>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <p className="text-xs text-gray-700">{book.short_description || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-4 mt-4 border-t sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowStorageModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Borrow Book Modal (inside storage view) */}
        {showBorrowModal && bookToBorrow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={() => { setShowBorrowModal(false); setBookToBorrow(null); setSelectedUserForBorrow('') }}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2"><img src="/borrow.png" alt="Lend book" className="w-6 h-6" /> Lend book</h2>
                <button onClick={() => { setShowBorrowModal(false); setBookToBorrow(null); setSelectedUserForBorrow('') }} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-bold text-lg text-gray-900 mb-3">{bookToBorrow.title}</p>
                <div className="space-y-1 mb-3">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                    <span>{bookToBorrow.author || '-'}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                    <span>{bookToBorrow.year || '-'}</span>
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <p className="text-xs text-gray-700">{bookToBorrow.short_description || ''}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select User to Borrow</label>
                <select
                  value={selectedUserForBorrow}
                  onChange={(e) => setSelectedUserForBorrow(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onClick={() => { setShowBorrowModal(false); setBookToBorrow(null); setSelectedUserForBorrow('') }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedUserForBorrow) {
                      handleBorrowBook(bookToBorrow.id, parseInt(selectedUserForBorrow))
                    }
                  }}
                  disabled={!selectedUserForBorrow}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  Borrow Book
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Move Book Modal */}
        {showMoveBookModal && bookToMove && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={() => { setShowMoveBookModal(false); setBookToMove(null); setSelectedShelfForMove(null) }}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2"><img src="/shelf.png" alt="Shelf" className="w-6 h-6" /> Move to Shelf</h2>
                <button onClick={() => { setShowMoveBookModal(false); setBookToMove(null); setSelectedShelfForMove(null) }} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-800">{bookToMove.title}</p>
              </div>

              <div className="space-y-4 mb-6">
                {allShelves && allShelves.length > 0 ? (
                  <select
                    value={selectedShelfForMove?.id || ''}
                    onChange={(e) => {
                      const shelf = allShelves.find(s => s.id === parseInt(e.target.value))
                      setSelectedShelfForMove(shelf || null)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Select a shelf --</option>
                    {allShelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        #{shelf.order}{shelf.name ? `: ${shelf.name}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-500">No shelves available</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowMoveBookModal(false); setBookToMove(null); setSelectedShelfForMove(null) }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (selectedShelfForMove && bookToMove) {
                      try {
                        const response = await fetch(`/api/books/${bookToMove.id}/move/`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            shelf_id: selectedShelfForMove.id,
                            status: 'library'
                          })
                        })
                        if (!response.ok) throw new Error(`API error: ${response.status}`)
                        await loadAllBooks()
                        await loadStorageBooks()
                        setShowMoveBookModal(false)
                        setBookToMove(null)
                        setSelectedShelfForMove(null)
                      } catch (err) {
                        setError(`Failed to move book: ${err instanceof Error ? err.message : 'Unknown error'}`)
                      }
                    }
                  }}
                  disabled={!selectedShelfForMove}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  Move Book
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shelf Detail Popup */}
        {shelfDetailPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-start mb-4 sticky top-0 bg-white pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <img src="/shelf.png" alt="Shelf" className="w-6 h-6" /> #{shelfDetailPopup.order}{shelfDetailPopup.name ? `: ${shelfDetailPopup.name}` : ''}
                </h2>
                <button
                  onClick={() => setShelfDetailPopup(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              {shelfDetailPopup.short_description && (
                <p className="text-sm text-gray-600 mb-4 text-center mt-2">{shelfDetailPopup.short_description}</p>
              )}
              {(() => {
                const shelfBooks = books.filter(b => b.shelf_id === shelfDetailPopup.id && b.status !== 'borrowed')
                return shelfBooks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No books on this shelf</p>
                ) : (
                  <div className="space-y-2">
                    {shelfBooks.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded border-l-4 border-amber-500 hover:bg-gray-100 transition-colors"
                      >
                      <div className="flex-1">
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
                              <span>{book.year}</span>
                            </p>
                          )}
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                          {book.status === 'borrowed' && (
                            <p className="text-xs text-green-600 mb-2">✅ Currently Borrowed</p>
                          )}
                          {book.short_description && (
                            <p className="text-xs text-gray-700">{book.short_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => setDetailPopup({ type: 'book', data: book })}
                          className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View details"
                        >
                          ℹ️
                        </button>
                        {book.status !== 'borrowed' && (
                          <button
                            onClick={() => {
                              setBookToBorrow(book)
                              setShowBorrowModal(true)
                            }}
                            className="px-2 py-1 hover:bg-green-50 rounded transition-colors"
                            title="Lend book"
                          >
                            <img src="/borrow.png" alt="Lend book" className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleMoveBook(book.id, null)}
                          className="px-2 py-1 hover:bg-orange-50 rounded transition-colors"
                          title="Move to storage"
                        >
                          <img src="/box.png" alt="Move to storage" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                )
              })()}
              <div className="flex gap-2 pt-4 mt-4 border-t sticky bottom-0 bg-white">
                <button
                  onClick={() => setShelfDetailPopup(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>

              {/* Detail Popup Modal for Books within Shelf */}
              {detailPopup && detailPopup.type === 'book' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        📚 <span>Book Details</span>
                      </h2>
                      <button
                        onClick={() => setDetailPopup(null)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-700">Title</h3>
                        <p className="text-gray-600 mt-1">
                          {(detailPopup.data as Book).title}
                        </p>
                      </div>
                      {((detailPopup.data as Book).author || (detailPopup.data as Book).year) && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Author & Year</h3>
                          <p className="text-gray-600 mt-1">
                            {(detailPopup.data as Book).author && <span>{(detailPopup.data as Book).author}</span>}
                            {(detailPopup.data as Book).year && <span> ({(detailPopup.data as Book).year})</span>}
                          </p>
                        </div>
                      )}
                      {(detailPopup.data as Book).short_description && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Short Description</h3>
                          <p className="text-gray-600 mt-1">
                            {(detailPopup.data as Book).short_description}
                          </p>
                        </div>
                      )}
                      {(detailPopup.data as Book).long_description && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Long Description</h3>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                            {(detailPopup.data as Book).long_description}
                          </p>
                        </div>
                      )}
                      {(detailPopup.data as Book).status && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Status</h3>
                          <p className="text-gray-600 mt-1">
                            {(detailPopup.data as Book).status === 'storage' && '📦 Storage'}
                            {(detailPopup.data as Book).status === 'library' && '📚 Library'}
                            {(detailPopup.data as Book).status === 'borrowed' && '👤 Borrowed'}
                          </p>
                        </div>
                      )}
                      {(detailPopup.data as Book).borrowed_by_user_name && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Borrowed By</h3>
                          <p className="text-gray-600 mt-1">
                            {(detailPopup.data as Book).borrowed_by_user_name}
                          </p>
                        </div>
                      )}
                      {(detailPopup.data as Book).borrow_date && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Borrow Date</h3>
                          <p className="text-gray-600 mt-1">
                            {new Date((detailPopup.data as Book).borrow_date!).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
                      <button
                        onClick={() => setDetailPopup(null)}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Select Storage Books Modal */}
        {showSelectStorageBooksModal && selectedShelfForAddingBooks && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Select Books from Storage</h2>
                <button
                  onClick={() => {
                    setShowSelectStorageBooksModal(false)
                    setSelectedShelfForAddingBooks(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              {storageBooks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No books in storage</p>
              ) : (
                <div className="space-y-2">
                  {storageBooks.map((book: any) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded border-l-4 border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex-1">
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
                              <span>{book.year}</span>
                            </p>
                          )}
                        </div>
                        {book.short_description && (
                          <div className="border-t border-gray-200 pt-2">
                            <p className="text-xs text-gray-700">{book.short_description}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/books/${book.id}/move/`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                shelf_id: selectedShelfForAddingBooks.id,
                                status: 'library'
                              })
                            })
                            if (!response.ok) throw new Error(`API error: ${response.status}`)
                            // Reload all books and storage books
                            await loadAllBooks()
                            await loadStorageBooks()
                            setShowSelectStorageBooksModal(false)
                            setSelectedShelfForAddingBooks(null)
                          } catch (err) {
                            setError(`Failed to move book: ${err instanceof Error ? err.message : 'Unknown error'}`)
                          }
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowSelectStorageBooksModal(false)
                    setSelectedShelfForAddingBooks(null)
                  }}
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

  if (selectedLibrary) {
    // LIBRARY DETAIL VIEW
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowNavPane(!showNavPane)}
                  className="text-gray-600 hover:text-gray-800 p-1"
                  title={showNavPane ? "Hide navigation" : "Show navigation"}
                >
                  {showNavPane ? "☰" : "►"}
                </button>
                <button
                  onClick={() => {
                    setSelectedLibrary(null)
                    setSelectedBookshelf(null)
                    setShowNavPane(true)
                    setExpandedBookshelves(new Set())
                    setActiveMainTab('dashboard')
                    updateUrl('dashboard')
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  title="Go back to dashboard"
                >
                  🏠
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2"><img src="/library.png" alt="Library" className="w-8 h-8" /> {selectedLibrary.name}</h1>
              <div></div>
            </div>
            {selectedLibrary.description && (
              <p className="text-gray-600 mt-2 text-center">{selectedLibrary.description}</p>
            )}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Pane */}
          {showNavPane && (
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                {/* <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><img src="/gps-navigation.png" alt="Navigation" className="w-5 h-5" /> Navigation</h3> */}
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
                                onClick={() => {
                                  const newExpanded = new Set(expandedBookshelves)
                                  if (isExpanded) {
                                    newExpanded.delete(library.id)
                                  } else {
                                    newExpanded.add(library.id)
                                  }
                                  setExpandedBookshelves(newExpanded)
                                }}
                                className="w-6 text-center px-1 py-1 text-gray-600 hover:bg-gray-200 rounded transition"
                                title="Toggle dropdown"
                              >
                                {isExpanded ? "▼" : "▶"}
                              </button>
                              <button
                                onClick={async () => {
                                  await handleSelectLibrary(library)
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
                                          onClick={() => {
                                            const newExpanded = new Set(expandedBookshelves)
                                            if (isBookshelfExpanded) {
                                              newExpanded.delete(bookshelf.id)
                                            } else {
                                              newExpanded.add(bookshelf.id)
                                            }
                                            setExpandedBookshelves(newExpanded)
                                          }}
                                          className="w-6 text-center px-1 py-1 text-gray-600 hover:bg-gray-200 rounded transition"
                                          title="Toggle dropdown"
                                        >
                                          {isBookshelfExpanded ? "▼" : "▶"}
                                        </button>
                                        <button
                                          onClick={async () => {
                                            setSelectedLibrary(library)
                                            await handleSelectBookshelf(bookshelf)
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
                                                setSelectedLibrary(library)
                                                await handleSelectBookshelf(bookshelf)
                                                setShelfDetailPopup(shelf)
                                              }}
                                              className="w-full flex items-center gap-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition text-left"
                                            >
                                              <img src="/shelf.png" alt="Shelf" className="w-4 h-4" /><span>{shelf.name || `#${shelf.order}`}</span>
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
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Bookshelves ({bookshelves.length})</h2>
            <button
              onClick={() => {
                setEditingBookshelf(null)
                setBookshelfFormData({ name: '', description: '' })
                setShowCreateBookshelfModal(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
            >
              ➕ Add Bookshelf
            </button>
          </div>

          {bookshelves.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No bookshelves yet. Create one to get started!</p>
              <button
                onClick={() => {
                  setEditingBookshelf(null)
                  setBookshelfFormData({ name: '', description: '' })
                  setShowCreateBookshelfModal(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Create First Bookshelf
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleBookshelfDragEnd}
            >
              <SortableContext
                items={bookshelves.map(b => b.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookshelves.map((bookshelf) => {
                    const bookshelfShelves = allShelves.filter(s => s.bookshelf_id === bookshelf.id)
                    const bookshelfBookCount = books.filter(b => bookshelfShelves.some(s => s.id === b.shelf_id) && b.status !== 'borrowed').length
                    return (
                      <DraggableBookshelfCard
                        key={bookshelf.id}
                        bookshelf={bookshelf}
                        bookCount={bookshelfBookCount}
                        onEdit={() => openEditBookshelfModal(bookshelf)}
                        onDelete={() => handleDeleteBookshelf(bookshelf.id)}
                        onSelect={() => handleSelectBookshelf(bookshelf)}
                        onInfo={() => setDetailPopup({ type: 'bookshelf', data: bookshelf })}
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

        {/* Create/Edit Bookshelf Modal */}
        {showCreateBookshelfModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBookshelf ? 'Edit Bookshelf' : 'Create New Bookshelf'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateBookshelfModal(false)
                    setEditingBookshelf(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={editingBookshelf ? handleUpdateBookshelf : handleCreateBookshelf} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bookshelf Name *</label>
                  <input
                    type="text"
                    required
                    value={bookshelfFormData.name}
                    onChange={(e) => setBookshelfFormData({ ...bookshelfFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Fiction Section"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={bookshelfFormData.short_description}
                    onChange={(e) => setBookshelfFormData({ ...bookshelfFormData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description (shown on card)"
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                  <textarea
                    value={bookshelfFormData.long_description}
                    onChange={(e) => setBookshelfFormData({ ...bookshelfFormData, long_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description (shown in detail popup)"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateBookshelfModal(false)
                      setEditingBookshelf(null)
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {isSubmitting ? 'Saving...' : editingBookshelf ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Popup Modal for Bookshelf View - Only for non-book types */}
        {detailPopup && (detailPopup.type === 'library' || detailPopup.type === 'bookshelf' || detailPopup.type === 'shelf') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {detailPopup.type === 'library' && <><img src="/library.png" alt="Library" className="w-6 h-6" /> <span>Library Details</span></>}
                  {detailPopup.type === 'bookshelf' && <><img src="/bookshelf.png" alt="Bookshelf" className="w-6 h-6" /> <span>Bookshelf Details</span></>}
                  {detailPopup.type === 'shelf' && <><img src="/shelf.png" alt="Shelf" className="w-6 h-6" /> <span>Shelf Details</span></>}
                </h2>
                <button
                  onClick={() => setDetailPopup(null)}
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
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Short Description</h3>
                  <p className="text-gray-600 mt-1">
                    {detailPopup.type === 'library' && ((detailPopup.data as Library).short_description || '(None)')}
                    {detailPopup.type === 'bookshelf' && ((detailPopup.data as Bookshelf).short_description || '(None)')}
                    {detailPopup.type === 'shelf' && ((detailPopup.data as Shelf).short_description || '(None)')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Long Description</h3>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                    {detailPopup.type === 'library' && ((detailPopup.data as Library).long_description || '(None)')}
                    {detailPopup.type === 'bookshelf' && ((detailPopup.data as Bookshelf).long_description || '(None)')}
                    {detailPopup.type === 'shelf' && ((detailPopup.data as Shelf).long_description || '(None)')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => setDetailPopup(null)}
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

  // MAIN VIEW - Dashboard with clickable cards
  if (activeMainTab === 'dashboard') {
    mainContent = (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><img src="/library.png" alt="Library" className="w-8 h-8" /> Library Monitor</h1>
              <p className="text-gray-600 mt-1">Manage your library collection efficiently</p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <DashboardClickable
            books={books}
            shelves={shelves}
            selectedBookshelf={selectedBookshelf}
            libraries={libraries}
            onStorageClick={() => {
              setActiveMainTab('storage')
              updateUrl('storage')
            }}
            onLibraryClick={() => {
              setActiveMainTab('libraries')
              updateUrl('libraries')
            }}
            onBorrowedClick={() => {
              setActiveMainTab('borrowed')
              updateUrl('borrowed')
            }}
            onManageBooks={() => {
              setActiveMainTab('manage-books')
              updateUrl('manage-books')
            }}
            onManageUsers={() => {
              setActiveMainTab('manage-users')
              updateUrl('manage-users')
            }}
          />
        </main>

        {showCreateBookModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 top-0 left-0 right-0 bottom-0" onClick={() => setShowCreateBookModal(false)}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add New Book</h2>
                <button onClick={() => setShowCreateBookModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              
              <form onSubmit={handleCreateBook} className="space-y-4">
                {/* Book Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Book title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Author name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={bookFormData.year}
                    onChange={(e) => setBookFormData({ ...bookFormData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Publication year"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={bookFormData.short_description}
                    onChange={(e) => setBookFormData({ ...bookFormData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                  <textarea
                    value={bookFormData.long_description}
                    onChange={(e) => setBookFormData({ ...bookFormData, long_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description"
                    rows={3}
                  />
                </div>
                
                {/* Placement Options */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Where to place this book?</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="placement"
                        value="storage"
                        checked={placementType === 'storage'}
                        onChange={(e) => setPlacementType(e.target.value as 'storage' | 'shelf')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Storage</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="placement"
                        value="shelf"
                        checked={placementType === 'shelf'}
                        onChange={(e) => setPlacementType(e.target.value as 'storage' | 'shelf')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Library Shelf</span>
                    </label>
                  </div>
                </div>
                
                {placementType === 'shelf' && (
                  <div className="space-y-3 bg-gray-50 p-3 rounded">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Library *</label>
                      <select
                        value={selectedLibraryForBook}
                        onChange={(e) => {
                          setSelectedLibraryForBook(e.target.value)
                          setSelectedBookshelfForBook('')
                          setSelectedShelfIdForBook('')
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select a library --</option>
                        {libraries.map((lib) => (
                          <option key={lib.id} value={lib.id}>{lib.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedLibraryForBook && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bookshelf *</label>
                        <select
                          value={selectedBookshelfForBook}
                          onChange={(e) => {
                            setSelectedBookshelfForBook(e.target.value)
                            setSelectedShelfIdForBook('')
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Select a bookshelf --</option>
                          {allBookshelves
                            .filter((bs) => bs.library_id === parseInt(selectedLibraryForBook))
                            .map((bs) => (
                              <option key={bs.id} value={bs.id}>{bs.name}</option>
                            ))}
                        </select>
                      </div>
                    )}
                    
                    {selectedBookshelfForBook && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shelf *</label>
                        <select
                          value={selectedShelfIdForBook}
                          onChange={(e) => setSelectedShelfIdForBook(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Select a shelf --</option>
                          {allShelves
                            .filter((s) => s.bookshelf_id === parseInt(selectedBookshelfForBook))
                            .map((s) => (
                              <option key={s.id} value={s.id}>#{s.order}{s.name ? `: ${s.name}` : ''}</option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Form Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateBookModal(false)
                      setBookFormData({ title: '', author: '', year: '', short_description: '', long_description: '' })
                      setPlacementType('storage')
                      setSelectedLibraryForBook('')
                      setSelectedBookshelfForBook('')
                      setSelectedShelfIdForBook('')
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Create Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (activeMainTab === 'storage') {
    const storageBooks = books.filter(b => (b.shelf_id === null && b.status === 'storage') || (b.shelf_id === null && !b.status))
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setActiveMainTab('dashboard')
                    updateUrl('dashboard')
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  title="Go back to dashboard"
                >
                  🏠
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2"><img src="/box.png" alt="Storage" className="w-8 h-8" /> Storage</h1>
              <div></div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {storageBooks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No books in storage</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storageBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 flex flex-col h-full">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">{book.title}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setDetailPopup({ type: 'book', data: book })}
                        className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        ℹ️
                      </button>
                      <button
                        onClick={() => {
                          setBookToBorrow(book)
                          setShowBorrowModal(true)
                        }}
                        className="px-2 py-1 hover:bg-green-50 rounded transition-colors"
                        title="Lend book"
                      >
                        <img src="/borrow.png" alt="Lend book" className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setBookToMove(book)
                          setShowMoveBookModal(true)
                        }}
                        className="px-2 py-1 hover:bg-orange-50 rounded transition-colors"
                        title="Move to shelf"
                      >
                        <img src="/shelf.png" alt="Shelf" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                      <span>{book.author || '-'}</span>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                      <span>{book.year || '-'}</span>
                    </p>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <p className="text-xs text-gray-700">{book.short_description || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Detail Popup Modal */}
        {detailPopup && detailPopup.type === 'book' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  📚 <span>Book Details</span>
                </h2>
                <button
                  onClick={() => setDetailPopup(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Title</h3>
                  <p className="text-gray-600 mt-1">
                    {(detailPopup.data as Book).title}
                  </p>
                </div>
                {((detailPopup.data as Book).author || (detailPopup.data as Book).year) && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Author & Year</h3>
                    <p className="text-gray-600 mt-1">
                      {(detailPopup.data as Book).author && <span>{(detailPopup.data as Book).author}</span>}
                      {(detailPopup.data as Book).year && <span> ({(detailPopup.data as Book).year})</span>}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).short_description && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Short Description</h3>
                    <p className="text-gray-600 mt-1">
                      {(detailPopup.data as Book).short_description}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).long_description && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Long Description</h3>
                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                      {(detailPopup.data as Book).long_description}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).status && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Status</h3>
                    <p className="text-gray-600 mt-1">
                      {(detailPopup.data as Book).status === 'storage' && '📦 Storage'}
                      {(detailPopup.data as Book).status === 'library' && '📚 Library'}
                      {(detailPopup.data as Book).status === 'borrowed' && '👤 Borrowed'}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).borrowed_by_user_name && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Borrowed By</h3>
                    <p className="text-gray-600 mt-1">
                      {(detailPopup.data as Book).borrowed_by_user_name}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).borrow_date && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Borrow Date</h3>
                    <p className="text-gray-600 mt-1">
                      {new Date((detailPopup.data as Book).borrow_date!).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => setDetailPopup(null)}
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

  if (activeMainTab === 'borrowed') {
    const borrowedBooks = books.filter(b => b.status === 'borrowed')
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setActiveMainTab('dashboard')
                    updateUrl('dashboard')
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  title="Go back to dashboard"
                >
                  🏠
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2"><img src="/borrow.png" alt="Borrowed" className="w-8 h-8" /> Borrowed</h1>
              <div></div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {borrowedBooks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No borrowed books</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {borrowedBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 flex flex-col h-full">
                  <div className="flex-1">
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
                          <span>{book.year}</span>
                        </p>
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      {book.short_description && (
                        <p className="text-xs text-gray-700 mb-1">{book.short_description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleReturnBook(book.id)}
                      className="flex-1 px-3 py-2 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded transition flex items-center justify-center gap-2"
                    >
                      <img src="/return_book.png" alt="Return to storage" className="w-4 h-4" />
                      Return to storage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Detail Popup Modal */}
        {detailPopup && detailPopup.type === 'book' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  📚 <span>Book Details</span>
                </h2>
                <button
                  onClick={() => setDetailPopup(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Title</h3>
                  <p className="text-gray-600 mt-1">
                    {(detailPopup.data as Book).title}
                  </p>
                </div>
                {((detailPopup.data as Book).author || (detailPopup.data as Book).year) && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Author & Year</h3>
                    <p className="text-gray-600 mt-1">
                      {(detailPopup.data as Book).author && <span>{(detailPopup.data as Book).author}</span>}
                      {(detailPopup.data as Book).year && <span> ({(detailPopup.data as Book).year})</span>}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).short_description && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Short Description</h3>
                    <p className="text-gray-600 mt-1">
                      {(detailPopup.data as Book).short_description}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).long_description && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Long Description</h3>
                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                      {(detailPopup.data as Book).long_description}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).status && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Status</h3>
                    <p className="text-gray-600 mt-1">
                      {(detailPopup.data as Book).status === 'storage' && '📦 Storage'}
                      {(detailPopup.data as Book).status === 'library' && '📚 Library'}
                      {(detailPopup.data as Book).status === 'borrowed' && '👤 Borrowed'}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).borrowed_by_user_name && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Borrowed By</h3>
                    <p className="text-gray-600 mt-1">
                      {(detailPopup.data as Book).borrowed_by_user_name}
                    </p>
                  </div>
                )}
                {(detailPopup.data as Book).borrow_date && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Borrow Date</h3>
                    <p className="text-gray-600 mt-1">
                      {new Date((detailPopup.data as Book).borrow_date!).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => setDetailPopup(null)}
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

  if (activeMainTab === 'libraries') {
    // LIBRARIES VIEW
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNavPane(!showNavPane)}
                className="text-gray-600 hover:text-gray-800 p-1"
                title={showNavPane ? "Hide navigation" : "Show navigation"}
              >
                {showNavPane ? "☰" : "►"}
              </button>
              <button
                onClick={() => {
                  setActiveMainTab('dashboard')
                  updateUrl('dashboard')
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
                title="Go back to dashboard"
              >
                🏠
              </button>
              <button
                onClick={() => {
                  setLibraryFormData({ name: '', description: '', address: '', phone: '', email: '' })
                  setShowCreateLibraryModal(true)
                }}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ New Library
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Pane */}
          {showNavPane && (
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                {/* <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><img src="/gps-navigation.png" alt="Navigation" className="w-5 h-5" /> Navigation</h3> */}
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
                                onClick={() => {
                                  const newExpanded = new Set(expandedBookshelves)
                                  if (isExpanded) {
                                    newExpanded.delete(library.id)
                                  } else {
                                    newExpanded.add(library.id)
                                  }
                                  setExpandedBookshelves(newExpanded)
                                }}
                                className="w-6 text-center px-1 py-1 text-gray-600 hover:bg-gray-200 rounded transition"
                                title="Toggle dropdown"
                              >
                                {isExpanded ? "▼" : "▶"}
                              </button>
                              <button
                                onClick={async () => {
                                  // Navigate to library detail view
                                  await handleSelectLibrary(library)
                                  // Keep tree expanded
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
                                          onClick={() => {
                                            const newExpanded = new Set(expandedBookshelves)
                                            if (isBookshelfExpanded) {
                                              newExpanded.delete(bookshelf.id)
                                            } else {
                                              newExpanded.add(bookshelf.id)
                                            }
                                            setExpandedBookshelves(newExpanded)
                                          }}
                                          className="w-6 text-center px-1 py-1 text-gray-600 hover:bg-gray-200 rounded transition"
                                          title="Toggle dropdown"
                                        >
                                          {isBookshelfExpanded ? "▼" : "▶"}
                                        </button>
                                        <button
                                          onClick={async () => {
                                            // Navigate to bookshelf detail view
                                            setSelectedLibrary(library)
                                            await handleSelectBookshelf(bookshelf)
                                            // Keep tree expanded
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
                                                // Navigate to bookshelf detail view with shelf details
                                                setSelectedLibrary(library)
                                                await handleSelectBookshelf(bookshelf)
                                                setShelfDetailPopup(shelf)
                                                // Keep tree expanded
                                              }}
                                              className="w-full flex items-center gap-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition text-left"
                                            >
                                              <img src="/shelf.png" alt="Shelf" className="w-4 h-4" /><span>{shelf.name || `#${shelf.order}`}</span>
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
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {libraries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No libraries yet. Create one to get started!</p>
              <button
                onClick={() => {
                  setLibraryFormData({ name: '', description: '', address: '', phone: '', email: '' })
                  setShowCreateLibraryModal(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Create First Library
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleLibraryDragEnd}
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
                        onSelect={() => handleSelectLibrary(library)}
                        onEdit={() => openEditLibraryModal(library)}
                        onDelete={() => handleDeleteLibrary(library.id)}
                        onInfo={() => setDetailPopup({ type: 'library', data: library })}
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
                  onClick={() => setDetailPopup(null)}
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
                  onClick={() => setDetailPopup(null)}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Library Modal */}
        {showCreateLibraryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingLibrary ? 'Edit Library' : 'Create New Library'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateLibraryModal(false)
                    setEditingLibrary(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={editingLibrary ? handleUpdateLibrary : handleCreateLibrary} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Library Name *</label>
                  <input
                    type="text"
                    required
                    value={libraryFormData.name}
                    onChange={(e) => setLibraryFormData({ ...libraryFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Central Library"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={libraryFormData.short_description}
                    onChange={(e) => setLibraryFormData({ ...libraryFormData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description (shown on card)"
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                  <textarea
                    value={libraryFormData.long_description}
                    onChange={(e) => setLibraryFormData({ ...libraryFormData, long_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description (shown in detail popup)"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={libraryFormData.address}
                    onChange={(e) => setLibraryFormData({ ...libraryFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={libraryFormData.phone}
                    onChange={(e) => setLibraryFormData({ ...libraryFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={libraryFormData.email}
                    onChange={(e) => setLibraryFormData({ ...libraryFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="library@example.com"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateLibraryModal(false)
                      setEditingLibrary(null)
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {isSubmitting ? 'Saving...' : editingLibrary ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (activeMainTab === 'manage-books') {
    // MANAGE BOOKS VIEW - Show all books grouped by status
    const storageCount = books.filter(b => b.status === 'storage').length
    const libraryCount = books.filter(b => b.status === 'library').length
    const borrowedCount = books.filter(b => b.status === 'borrowed').length

    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveMainTab('dashboard')
                  updateUrl('dashboard')
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
                title="Go back to dashboard"
              >
                🏠
              </button>
              <h1 className="text-3xl font-bold text-gray-900">📚 Manage Books</h1>
              <button
                onClick={() => {
                  setBookFormData({ title: '', author: '', year: '', short_description: '', long_description: '' })
                  setPlacementType('storage')
                  setShowCreateBookModal(true)
                }}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Add New Book
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Status Tabs */}
          <div className="flex gap-4 mb-6">
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition">
              📦 Storage <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">{storageCount}</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition">
              <img src="/library.png" alt="Library" className="w-5 h-5" /> Library <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">{libraryCount}</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition">
              👤 Borrowed <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-sm">{borrowedCount}</span>
            </button>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No books yet. Add one to get started!</p>
              <button
                onClick={() => {
                  setBookFormData({ title: '', author: '', year: '', short_description: '', long_description: '' })
                  setShowCreateBookModal(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Add First Book
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Storage Books */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Storage ({storageCount})</h2>
                {books.filter(b => b.status === 'storage').length === 0 ? (
                  <p className="text-gray-500">No books in storage</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books.filter(b => b.status === 'storage').map((book) => (
                      <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500 hover:shadow-lg transition flex flex-col h-full">
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-900">{book.title}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingBook(book)
                                setBookFormData({
                                  title: book.title,
                                  author: book.author || '',
                                  year: book.year || '',
                                  short_description: book.short_description || '',
                                  long_description: book.long_description || ''
                                })
                                setShowCreateBookModal(true)
                              }}
                              className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Edit book"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id, book.shelf_id || null)}
                              className="w-10 h-10 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Delete book"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                            <span>{book.author || '-'}</span>
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                            <span>{book.year || '-'}</span>
                          </p>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-auto">
                          <p className="text-xs text-gray-700">{book.short_description || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Library Books */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><img src="/library.png" alt="Library" className="w-5 h-5" /> Library ({libraryCount})</h2>
                {books.filter(b => b.status === 'library').length === 0 ? (
                  <p className="text-gray-500">No books in library</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books.filter(b => b.status === 'library').map((book) => (
                      <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 hover:shadow-lg transition flex flex-col h-full">
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-900">{book.title}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingBook(book)
                                setBookFormData({
                                  title: book.title,
                                  author: book.author || '',
                                  year: book.year || '',
                                  short_description: book.short_description || '',
                                  long_description: book.long_description || ''
                                })
                                setShowCreateBookModal(true)
                              }}
                              className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Edit book"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id, book.shelf_id || null)}
                              className="w-10 h-10 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Delete book"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                            <span>{book.author || '-'}</span>
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                            <span>{book.year || '-'}</span>
                          </p>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-auto">
                          <p className="text-xs text-gray-700">{book.short_description || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Borrowed Books */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Borrowed ({borrowedCount})</h2>
                {books.filter(b => b.status === 'borrowed').length === 0 ? (
                  <p className="text-gray-500">No borrowed books</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books.filter(b => b.status === 'borrowed').map((book) => (
                      <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 hover:shadow-lg transition flex flex-col h-full">
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-900">{book.title}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingBook(book)
                                setBookFormData({
                                  title: book.title,
                                  author: book.author || '',
                                  year: book.year || '',
                                  short_description: book.short_description || '',
                                  long_description: book.long_description || ''
                                })
                                setShowCreateBookModal(true)
                              }}
                              className="w-10 h-10 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Edit book"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id, book.shelf_id || null)}
                              className="w-10 h-10 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Delete book"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                            <span>{book.author || '-'}</span>
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                            <span>{book.year || '-'}</span>
                          </p>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-auto">
                          <p className="text-xs text-gray-700">{book.short_description || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Create/Edit Book Modal */}
        {showCreateBookModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 top-0 left-0 right-0 bottom-0" onClick={() => setShowCreateBookModal(false)}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
                <button onClick={() => { setShowCreateBookModal(false); setEditingBook(null) }} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              
              <form onSubmit={editingBook ? handleUpdateBook : handleCreateBook} className="space-y-4">
                {/* Book Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Book title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Author name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={bookFormData.year}
                    onChange={(e) => setBookFormData({ ...bookFormData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Publication year"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={bookFormData.short_description}
                    onChange={(e) => setBookFormData({ ...bookFormData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                  <textarea
                    value={bookFormData.long_description}
                    onChange={(e) => setBookFormData({ ...bookFormData, long_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description"
                    rows={3}
                  />
                </div>
                
                {!editingBook && (
                  <>
                    {/* Placement Options */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Where to place this book?</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="placement"
                            value="storage"
                            checked={placementType === 'storage'}
                            onChange={(e) => setPlacementType(e.target.value as 'storage' | 'shelf')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Storage</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="placement"
                            value="shelf"
                            checked={placementType === 'shelf'}
                            onChange={(e) => setPlacementType(e.target.value as 'storage' | 'shelf')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Library Shelf</span>
                        </label>
                      </div>
                    </div>
                    
                    {placementType === 'shelf' && (
                      <div className="space-y-3 bg-gray-50 p-3 rounded">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Library *</label>
                          <select
                            value={selectedLibraryForBook}
                            onChange={(e) => {
                              setSelectedLibraryForBook(e.target.value)
                              setSelectedBookshelfForBook('')
                              setSelectedShelfIdForBook('')
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Select a library --</option>
                            {libraries.map((lib) => (
                              <option key={lib.id} value={lib.id}>{lib.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        {selectedLibraryForBook && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bookshelf *</label>
                            <select
                              value={selectedBookshelfForBook}
                              onChange={(e) => {
                                setSelectedBookshelfForBook(e.target.value)
                                setSelectedShelfIdForBook('')
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-- Select a bookshelf --</option>
                              {allBookshelves
                                .filter((bs) => bs.library_id === parseInt(selectedLibraryForBook))
                                .map((bs) => (
                                  <option key={bs.id} value={bs.id}>{bs.name}</option>
                                ))}
                            </select>
                          </div>
                        )}
                        
                        {selectedBookshelfForBook && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shelf *</label>
                            <select
                              value={selectedShelfIdForBook}
                              onChange={(e) => setSelectedShelfIdForBook(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-- Select a shelf --</option>
                              {allShelves
                                .filter((s) => s.bookshelf_id === parseInt(selectedBookshelfForBook))
                                .map((s) => (
                                  <option key={s.id} value={s.id}>#{s.order}{s.name ? `: ${s.name}` : ''}</option>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {/* Form Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateBookModal(false)
                      setEditingBook(null)
                      setBookFormData({ title: '', author: '', year: '', short_description: '', long_description: '' })
                      setPlacementType('storage')
                      setSelectedLibraryForBook('')
                      setSelectedBookshelfForBook('')
                      setSelectedShelfIdForBook('')
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {isSubmitting ? 'Saving...' : editingBook ? 'Update Book' : 'Create Book'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (activeMainTab === 'manage-users') {
    // MANAGE USERS VIEW - Show all users
    mainContent = (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveMainTab('dashboard')
                  updateUrl('dashboard')
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
                title="Go back to dashboard"
              >
                🏠
              </button>
              <h1 className="text-3xl font-bold text-gray-900">👥 Manage Users</h1>
              <button
                onClick={() => {
                  setUserFormData({
                    full_name: '',
                    dob: '',
                    phone: '',
                    short_description: '',
                    long_description: ''
                  })
                  setEditingUser(null)
                  setShowCreateUserModal(true)
                }}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Add New User
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No users yet. Add one to get started!</p>
              <button
                onClick={() => {
                  setUserFormData({
                    full_name: '',
                    dob: '',
                    phone: '',
                    short_description: '',
                    long_description: ''
                  })
                  setEditingUser(null)
                  setShowCreateUserModal(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ Add First User
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500 hover:shadow-lg transition">
                  <p className="font-semibold text-gray-800 text-lg">{user.full_name}</p>
                  {user.phone && <p className="text-sm text-gray-600 mt-2">📞 {user.phone}</p>}
                  {user.dob && <p className="text-sm text-gray-600">🎂 {user.dob}</p>}
                  {user.short_description && <p className="text-sm text-gray-600 mt-3">{user.short_description}</p>}
                  {user.long_description && <p className="text-xs text-gray-500 mt-2 italic">{user.long_description}</p>}
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => {
                        setEditingUser(user)
                        setUserFormData({
                          full_name: user.full_name,
                          dob: user.dob || '',
                          phone: user.phone || '',
                          short_description: user.short_description || '',
                          long_description: user.long_description || ''
                        })
                        setShowCreateUserModal(true)
                      }}
                      className="flex-1 text-sm px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-1 text-sm px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  // Render main content or fallback, plus global modal
  return (
    <>
      {mainContent || (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading...</h1>
            <p className="text-gray-600">Please wait</p>
          </div>
        </div>
      )}

      {/* Global User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={() => setShowCreateUserModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => { setShowCreateUserModal(false); setEditingUser(null) }} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={userFormData.dob}
                  onChange={(e) => setUserFormData({ ...userFormData, dob: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={userFormData.short_description}
                  onChange={(e) => setUserFormData({ ...userFormData, short_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                <textarea
                  value={userFormData.long_description}
                  onChange={(e) => setUserFormData({ ...userFormData, long_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed description"
                  rows={4}
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUserModal(false)
                    setEditingUser(null)
                    setUserFormData({ full_name: '', dob: '', phone: '', short_description: '', long_description: '' })
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

