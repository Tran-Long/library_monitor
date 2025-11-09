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
            <h3 className="text-xl font-semibold text-gray-800">🏛️ {library.name}</h3>
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
            <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">� {bookCount}</span>
            <h3 className="text-lg font-semibold text-gray-800">�️ {bookshelf.name}</h3>
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
            <div className="absolute -top-3 left-0 bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              📍 #{shelf.order}{shelf.name ? `: ${shelf.name}` : ''} • 📚 Books: {books.length}
            </div>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddBook(shelf)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-green-600 hover:bg-green-50 hover:text-green-800 transition-colors"
            title="Add book"
          >
            📖
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
            className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
            title="Delete shelf"
          >
            🗑️
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
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [detailPopup, setDetailPopup] = useState<{ type: 'library' | 'bookshelf' | 'shelf' | 'book'; data: Library | Bookshelf | Shelf | Book } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedLibraryForBook, setSelectedLibraryForBook] = useState<string>('')
  const [selectedBookshelfForBook, setSelectedBookshelfForBook] = useState<string>('')
  const [selectedShelfIdForBook, setSelectedShelfIdForBook] = useState<string>('')
  const [placementType, setPlacementType] = useState<'storage' | 'shelf'>('storage')
  

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

  useEffect(() => {
    loadLibraries()
    loadAllBooks()
    loadUsers()
  }, [])

  // ============= LIBRARIES =============
  const loadLibraries = async () => {
    try {
      const response = await fetch('/api/libraries/')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setLibraries(data)
      
      // Load all bookshelves for the modal dropdown
      try {
        const allBs: Bookshelf[] = []
        const allSh: Shelf[] = []
        for (const lib of data) {
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
      if (selectedShelfForBook) await loadBooks(selectedShelfForBook.id)
    } catch (err) {
      setError(`Failed to create book: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
    } catch (err) {
      setError(`Failed to move book: ${err instanceof Error ? err.message : 'Unknown error'}`)
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

    // Update backend with new order
    try {
      await fetch(`/api/libraries/${active.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newIndex })
      })
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

    // Update backend with new order
    try {
      await fetch(`/api/bookshelves/${active.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newIndex })
      })
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
    } catch (err) {
      console.error('Failed to update shelf order:', err)
      await loadShelves(selectedBookshelf.id)
    }
  }

  // ============= RENDER =============
  if (selectedBookshelf && selectedLibrary) {
    // BOOKSHELF DETAIL VIEW - Show shelves
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedBookshelf(null)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Bookshelves
                </button>
                <h1 className="text-3xl font-bold text-gray-900">🎯 {selectedBookshelf.name}</h1>
              </div>
            </div>
            {selectedBookshelf.description && (
              <p className="text-gray-600 mt-2">{selectedBookshelf.description}</p>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {error && (
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
                          const shelfBooks = books.filter(b => b.shelf_id === shelf.id)
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
        </main>

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
                <div className="space-y-2">
                  {storageBooks.map((book) => (
                    <div
                      key={book.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('bookId', book.id.toString())
                      }}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded border-l-4 border-blue-500 cursor-move hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 select-none">
                        <p className="font-semibold text-gray-800">{book.title}</p>
                        {(book.author || book.year) && (
                          <p className="text-sm text-gray-600">
                            {book.author && <span>{book.author}</span>}
                            {book.year && <span> ({book.year})</span>}
                          </p>
                        )}
                        {book.short_description && (
                          <p className="text-xs text-gray-600 mt-1">{book.short_description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-2">
                        {book.long_description && (
                          <button
                            onClick={() => setDetailPopup({ type: 'book', data: book })}
                            className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View details"
                          >
                            ℹ️
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBook(book.id, null)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete book"
                        >
                          🗑️
                        </button>
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

        {/* Shelf Detail Popup */}
        {shelfDetailPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  📍 #{shelfDetailPopup.order}{shelfDetailPopup.name ? `: ${shelfDetailPopup.name}` : ''}
                </h2>
                <button
                  onClick={() => setShelfDetailPopup(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              {shelfDetailPopup.short_description && (
                <p className="text-sm text-gray-600 mb-4">{shelfDetailPopup.short_description}</p>
              )}
              {(() => {
                const shelfBooks = books.filter(b => b.shelf_id === shelfDetailPopup.id)
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
                        <p className="font-semibold text-gray-800">{book.title}</p>
                        {(book.author || book.year) && (
                          <p className="text-sm text-gray-600">
                            {book.author && <span>{book.author}</span>}
                            {book.year && <span> ({book.year})</span>}
                          </p>
                        )}
                        {book.short_description && (
                          <p className="text-xs text-gray-600 mt-1">{book.short_description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-2">
                        {book.long_description && (
                          <button
                            onClick={() => setDetailPopup({ type: 'book', data: book })}
                            className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View details"
                          >
                            ℹ️
                          </button>
                        )}
                        <button
                          onClick={() => handleMoveBook(book.id, null)}
                          className="px-2 py-1 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Move to storage"
                        >
                          📦
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id, shelfDetailPopup.id)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete book"
                        >
                          🗑️
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
                        <p className="font-semibold text-gray-800">{book.title}</p>
                        {(book.author || book.year) && (
                          <p className="text-sm text-gray-600">
                            {book.author && <span>{book.author}</span>}
                            {book.year && <span> ({book.year})</span>}
                          </p>
                        )}
                        {book.short_description && (
                          <p className="text-xs text-gray-600 mt-1">{book.short_description}</p>
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
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedLibrary(null)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Libraries
              </button>
              <h1 className="text-3xl font-bold text-gray-900">📚 {selectedLibrary.name}</h1>
            </div>
            {selectedLibrary.description && (
              <p className="text-gray-600 mt-2">{selectedLibrary.description}</p>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
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
                    const bookshelfBookCount = books.filter(b => bookshelfShelves.some(s => s.id === b.shelf_id)).length
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
        </main>

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

        {/* Detail Popup Modal for Bookshelf View */}
        {detailPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {detailPopup.type === 'library' && '🏛️ Library Details'}
                  {detailPopup.type === 'bookshelf' && '🗂️ Bookshelf Details'}
                  {detailPopup.type === 'shelf' && '📍 Shelf Details'}
                  {detailPopup.type === 'book' && '📚 Book Details'}
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
              <h1 className="text-3xl font-bold text-gray-900">🏛️ Library Monitor</h1>
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
            onStorageClick={() => setActiveMainTab('storage')}
            onLibraryClick={() => setActiveMainTab('libraries')}
            onBorrowedClick={() => setActiveMainTab('borrowed')}
            onManageBooks={() => setActiveMainTab('manage-books')}
            onManageUsers={() => setActiveMainTab('manage-users')}
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
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => setActiveMainTab('dashboard')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">📦 Storage</h1>
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
                <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-800">{book.title}</p>
                  {book.author && <p className="text-sm text-gray-600">{book.author}</p>}
                  {book.year && <p className="text-sm text-gray-500">{book.year}</p>}
                  {book.short_description && <p className="text-xs text-gray-600 mt-2">{book.short_description}</p>}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  if (activeMainTab === 'borrowed') {
    const borrowedBooks = books.filter(b => b.status === 'borrowed')
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => setActiveMainTab('dashboard')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">✨ Borrowed</h1>
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
                <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                  <p className="font-semibold text-gray-800">{book.title}</p>
                  {book.author && <p className="text-sm text-gray-600">{book.author}</p>}
                  {book.year && <p className="text-sm text-gray-500">{book.year}</p>}
                  {book.short_description && <p className="text-xs text-gray-600 mt-2">{book.short_description}</p>}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  if (activeMainTab === 'libraries') {
    // LIBRARIES VIEW
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveMainTab('dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">🏛️ Libraries</h1>
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

        <main className="max-w-7xl mx-auto px-4 py-8">
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
                    const libraryBookCount = books.filter(b => libraryShelves.some(s => s.id === b.shelf_id)).length
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
        </main>
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
                onClick={() => setActiveMainTab('dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
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
              🏛️ Library <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">{libraryCount}</span>
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
                      <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500 hover:shadow-lg transition">
                        <p className="font-semibold text-gray-800">{book.title}</p>
                        {book.author && <p className="text-sm text-gray-600">{book.author}</p>}
                        {book.year && <p className="text-sm text-gray-500">{book.year}</p>}
                        {book.short_description && <p className="text-xs text-gray-600 mt-2">{book.short_description}</p>}
                        <div className="flex gap-2 mt-4">
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
                            className="flex-1 text-sm px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="flex-1 text-sm px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Library Books */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">🏛️ Library ({libraryCount})</h2>
                {books.filter(b => b.status === 'library').length === 0 ? (
                  <p className="text-gray-500">No books in library</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books.filter(b => b.status === 'library').map((book) => (
                      <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 hover:shadow-lg transition">
                        <p className="font-semibold text-gray-800">{book.title}</p>
                        {book.author && <p className="text-sm text-gray-600">{book.author}</p>}
                        {book.year && <p className="text-sm text-gray-500">{book.year}</p>}
                        {book.short_description && <p className="text-xs text-gray-600 mt-2">{book.short_description}</p>}
                        <div className="flex gap-2 mt-4">
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
                            className="flex-1 text-sm px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="flex-1 text-sm px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
                          >
                            Delete
                          </button>
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
                      <div key={book.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 hover:shadow-lg transition">
                        <p className="font-semibold text-gray-800">{book.title}</p>
                        {book.author && <p className="text-sm text-gray-600">{book.author}</p>}
                        {book.year && <p className="text-sm text-gray-500">{book.year}</p>}
                        {book.short_description && <p className="text-xs text-gray-600 mt-2">{book.short_description}</p>}
                        <div className="flex gap-2 mt-4">
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
                            className="flex-1 text-sm px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="flex-1 text-sm px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
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
                onClick={() => setActiveMainTab('dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 top-0 left-0 right-0 bottom-0" onClick={() => setShowCreateUserModal(false)}>
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
