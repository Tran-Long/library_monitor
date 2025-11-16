import '@/styles/globals.css'
import React, { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import type { Library, Bookshelf, Shelf, Book, User } from '@/types'
import DashboardClickable from '@/components/DashboardClickable'
import { useBorrowings } from '@/hooks'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
// Import new modular components
import { DraggableLibraryCard, DraggableBookshelfCard, DraggableShelfCard } from '@/components/draggable'
import { BookDetailModal, BorrowBookModal, BorrowConfirmationModal, ReturnConfirmationModal, MoveBookModal } from '@/components/modals'
// Import extracted views (Phase 3)
import { BorrowedView, ManageUsersView, ManageBooksView, LibrariesView } from '@/views'

/**
 * Format a date string (YYYY-MM-DD) as dd/mm/yyyy
 */
function formatDateAsddmmyy(dateValue: string | Date | null | undefined): string {
  if (dateValue === null || dateValue === undefined || dateValue === '') return ''
  
  let date: Date
  
  if (typeof dateValue === 'string') {
    // Parse ISO date string (YYYY-MM-DD) manually to avoid timezone issues
    const parts = dateValue.split('T')[0].split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      date = new Date(year, month, day)
    } else {
      return ''
    }
  } else if (dateValue instanceof Date) {
    date = dateValue
  } else {
    return ''
  }
  
  if (isNaN(date.getTime())) return ''
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())
  
  return `${day}/${month}/${year}`
}

function AppContent() {
  // Data hooks
  const { borrowings, fetchBorrowings } = useBorrowings()
  const { t } = useLanguage()
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
  const [shelfColumnsView, setShelfColumnsView] = useState<1 | 2>(2)
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'libraries' | 'borrowed' | 'manage-books' | 'manage-users'>('dashboard')
  
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
  const [showBorrowConfirmation, setShowBorrowConfirmation] = useState(false)
  const [selectedUserForConfirmation, setSelectedUserForConfirmation] = useState<User | null>(null)
  const [showReturnConfirmation, setShowReturnConfirmation] = useState(false)
  const [borrowingToReturn, setBorrowingToReturn] = useState<any>(null)
  const [onReturnCompleteCallback, setOnReturnCompleteCallback] = useState<(() => Promise<void>) | null>(null)
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
    gender: '',
    department: '',
    phone: '',
    dob: '',
    short_description: '',
    long_description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Variable to hold the main content that will be rendered at the bottom
  let mainContent: React.ReactNode = null

  // Helper function to restore state from path string
  const restoreStateFromPath = async (path: string, librariesData: Library[]) => {
    // Close all modals when restoring state from URL
    closeAllModals()
    
    const parts = path.split('/').filter(p => p)

    if (parts.length === 0) {
      // Root path - dashboard
      setActiveMainTab('dashboard')
      setSelectedLibrary(null)
      setSelectedBookshelf(null)
      return
    }

    const tab = parts[0] as 'dashboard' | 'libraries' | 'borrowed' | 'manage-books' | 'manage-users'
    const libraryId = parts[1] ? parseInt(parts[1]) : undefined
    const bookshelfId = parts[2] ? parseInt(parts[2]) : undefined

    setActiveMainTab(tab)

    // Handle libraries view
    if (tab === 'libraries') {
      if (!libraryId) {
        // Viewing all libraries - clear selections
        setSelectedLibrary(null)
        setSelectedBookshelf(null)
        setBookshelves([])
        setShelves([])
        return
      }
      // Restore library/bookshelf state if specific library selected
      if (librariesData.length > 0) {
        const lib = librariesData.find((l: Library) => l.id === libraryId)
        if (lib) {
          setSelectedLibrary(lib)
          setExpandedBookshelves((prev: Set<number>) => {
            const newExpanded = new Set(prev)
            newExpanded.add(libraryId)
            return newExpanded
          })
          
          try {
            // Load bookshelves for this library
            const bsResponse = await fetch(`/api/libraries/${libraryId}/bookshelves/`)
            if (!bsResponse.ok) throw new Error(`Failed to load bookshelves: ${bsResponse.status}`)
            const bsData = await bsResponse.json()
            setBookshelves(bsData)
            
            // Restore bookshelf if needed
            if (bookshelfId) {
              const bs = bsData.find((b: Bookshelf) => b.id === bookshelfId)
              if (bs) {
                setSelectedBookshelf(bs)
                setExpandedBookshelves((prev: Set<number>) => {
                  const newExpanded = new Set(prev)
                  newExpanded.add(bookshelfId)
                  return newExpanded
                })
                
                // Load shelves for this bookshelf
                const shResponse = await fetch(`/api/bookshelves/${bookshelfId}/shelves/`)
                if (!shResponse.ok) throw new Error(`Failed to load shelves: ${shResponse.status}`)
                const shData = await shResponse.json()
                setShelves(shData)
              } else {
                setSelectedBookshelf(null)
                setShelves([])
              }
            } else {
              setSelectedBookshelf(null)
              setShelves([])
            }
          } catch (err) {
            console.error('Failed to restore from URL:', err)
            // Fallback: stay in libraries view but clear selections
            setSelectedLibrary(null)
            setSelectedBookshelf(null)
            setBookshelves([])
            setShelves([])
          }
        } else {
          // Library ID in URL but not found in data
          setSelectedLibrary(null)
          setSelectedBookshelf(null)
          setBookshelves([])
          setShelves([])
        }
      }
    } else if (tab !== 'libraries') {
      // Not in libraries view, clear library/bookshelf selections
      setSelectedLibrary(null)
      setSelectedBookshelf(null)
      setBookshelves([])
      setShelves([])
    }
  }

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

  // Helper function to close all modals and clear modal-related state
  const closeAllModals = () => {
    // Hide all modals
    setShowCreateLibraryModal(false)
    setShowCreateBookshelfModal(false)
    setShowCreateShelfModal(false)
    setShowCreateBookModal(false)
    setShowCreateUserModal(false)
    setShowStorageModal(false)
    setShowSelectStorageBooksModal(false)
    setShowBorrowModal(false)
    setShowBorrowConfirmation(false)
    setShowReturnConfirmation(false)
    setShowMoveBookModal(false)
    
    // Clear modal-related data
    setShelfDetailPopup(null)
    setSelectedShelfForAddingBooks(null)
    setSelectedShelfForBook(null)
    setEditingLibrary(null)
    setEditingBookshelf(null)
    setEditingShelf(null)
    setEditingBook(null)
    setEditingUser(null)
    setDetailPopup(null)
    setBookToBorrow(null)
    setSelectedUserForConfirmation(null)
    setBorrowingToReturn(null)
    setOnReturnCompleteCallback(null)
    setBookToMove(null)
    setSelectedShelfForMove(null)
    setSelectedUserForBorrow('')
    setSelectedLibraryForBook('')
    setSelectedBookshelfForBook('')
    setSelectedShelfIdForBook('')
    setPlacementType('storage')
  }

  // Initial load and history listener
  useEffect(() => {
    const loadInitialData = async () => {
      await loadLibraries()
      await loadAllBooks()
      await loadUsers()
      await fetchBorrowings()
    }
    loadInitialData()
  }, [fetchBorrowings])

  // Refresh borrowings when switching to manage-books tab
  useEffect(() => {
    if (activeMainTab === 'manage-books') {
      fetchBorrowings()
    }
  }, [activeMainTab, fetchBorrowings])

  // Restore state from URL after data loads (on initial page load and when libraries change)
  useEffect(() => {
    if (libraries.length > 0) {
      const path = window.location.pathname
      restoreStateFromPath(path, libraries)
    }
  }, [libraries])

  // Log activeMainTab changes for debugging
  useEffect(() => {
    console.log('activeMainTab changed to:', activeMainTab)
  }, [activeMainTab])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      console.log('popstate event fired, path:', window.location.pathname)
      // Close all modals when navigating back/forward
      closeAllModals()
      // Restore state from URL
      restoreStateFromPath(window.location.pathname, libraries)
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
      console.log('Loaded books from API:', data)
      const borrowedBooks = data.filter((b: any) => b.status === 'borrowed')
      console.log('Borrowed books:', borrowedBooks)
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
    closeAllModals()
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
    closeAllModals()
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

      // Parse year from input (ISO date string YYYY-MM-DD)
      let yearValue: string | undefined = undefined
      if (bookFormData.year.trim()) {
        // Already in YYYY-MM-DD format from date picker
        yearValue = bookFormData.year
      }

      // Helper function to normalize strings for comparison (eliminate redundant spaces)
      const normalizeString = (str: string): string => {
        return str.trim().replace(/\s+/g, ' ').toLowerCase()
      }

      // Check for duplicates: Only compare non-blank/non-null properties of the new book
      const normalizedNewTitle = normalizeString(bookFormData.title)
      const normalizedNewAuthor = normalizeString(bookFormData.author || '')
      const normalizedNewShortDesc = normalizeString(bookFormData.short_description || '')
      const hasNewAuthor = bookFormData.author && bookFormData.author.trim()
      const hasNewYear = yearValue && yearValue.trim()
      const hasNewShortDesc = bookFormData.short_description && bookFormData.short_description.trim()

      const isDuplicate = books.some(book => {
        const normalizedExistingTitle = normalizeString(book.title || '')
        const normalizedExistingAuthor = normalizeString(book.author || '')
        const normalizedExistingShortDesc = normalizeString(book.short_description || '')

        // Always compare title (it's required)
        let matches = normalizedNewTitle === normalizedExistingTitle

        // Only compare author if the new book has an author
        if (matches && hasNewAuthor) {
          matches = normalizedNewAuthor === normalizedExistingAuthor
        }

        // Only compare year if the new book has a year
        if (matches && hasNewYear) {
          matches = yearValue === book.year
        }

        // Only compare short description if the new book has a short description
        if (matches && hasNewShortDesc) {
          matches = normalizedNewShortDesc === normalizedExistingShortDesc
        }

        return matches
      })

      if (isDuplicate) {
        setError('This book already exists in the database (checking based on filled-in fields)')
        setIsSubmitting(false)
        return
      }

      const payload = {
        title: bookFormData.title,
        author: bookFormData.author || undefined,
        year: yearValue || undefined,
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
        year: bookFormData.year || undefined,
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

      if (!userFormData.gender) {
        setError('Gender is required')
        setIsSubmitting(false)
        return
      }

      // Helper function to normalize strings for comparison (eliminate redundant spaces)
      const normalizeString = (str: string): string => {
        return str.trim().replace(/\s+/g, ' ').toLowerCase()
      }

      // Check for duplicates: Only compare non-blank/non-null properties of the new user
      const normalizedNewName = normalizeString(userFormData.full_name)
      const normalizedNewDepartment = normalizeString(userFormData.department || '')
      const normalizedNewPhone = normalizeString(userFormData.phone || '')
      const newDob = userFormData.dob || null
      const hasNewDepartment = userFormData.department && userFormData.department.trim()
      const hasNewPhone = userFormData.phone && userFormData.phone.trim()
      const hasNewDob = newDob && newDob.trim()

      const isDuplicate = users.some(user => {
        const normalizedExistingName = normalizeString(user.full_name || '')
        const normalizedExistingDepartment = normalizeString(user.department || '')
        const normalizedExistingPhone = normalizeString(user.phone || '')
        const existingDob = user.dob || null

        // Always compare name and gender (both are required)
        let matches = normalizedNewName === normalizedExistingName && userFormData.gender === user.gender

        // Only compare DOB if the new user has a DOB
        if (matches && hasNewDob) {
          matches = newDob === existingDob
        }

        // Only compare department if the new user has a department
        if (matches && hasNewDepartment) {
          matches = normalizedNewDepartment === normalizedExistingDepartment
        }

        // Only compare phone if the new user has a phone
        if (matches && hasNewPhone) {
          matches = normalizedNewPhone === normalizedExistingPhone
        }

        return matches
      })

      if (isDuplicate) {
        setError('This user already exists in the database (checking based on filled-in fields)')
        setIsSubmitting(false)
        return
      }

      const payload = {
        full_name: userFormData.full_name,
        gender: userFormData.gender,
        department: userFormData.department || null,
        phone: userFormData.phone || null,
        dob: userFormData.dob || null,
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
      setUserFormData({ full_name: '', gender: '', department: '', phone: '', dob: '', short_description: '', long_description: '' })
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

      if (!userFormData.gender) {
        setError('Gender is required')
        setIsSubmitting(false)
        return
      }

      const payload = {
        full_name: userFormData.full_name,
        gender: userFormData.gender,
        department: userFormData.department || null,
        phone: userFormData.phone || null,
        dob: userFormData.dob || null,
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
      setUserFormData({ full_name: '', gender: '', department: '', phone: '', dob: '', short_description: '', long_description: '' })
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

  const handleReturnBook = async (bookId: number) => {
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

  const handleMoveToStorage = async (bookId: number) => {
    try {
      const response = await fetch(`/api/books/${bookId}/return/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      await loadAllBooks()
      await loadStorageBooks()
    } catch (err) {
      setError(`Failed to move book to storage: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
                  title={showNavPane ? t('hideNavigation') : t('showNavigation')}
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
                  title={t('goBackToDashboard')}
                >
                  🏠
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2"><img src="/bookshelf.png" alt="Bookshelf" className="w-8 h-8" /> {selectedBookshelf.name}</h1>
              <LanguageSwitcher />
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
              <h2 className="text-2xl font-bold text-gray-800">{t('shelves_count').replace('{count}', shelves.length.toString())}</h2>
              <button
                onClick={() => {
                  setEditingShelf(null)
                  setShelfFormData({ name: '', description: '', short_description: '', long_description: '' })
                  setShowCreateShelfModal(true)
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
              >
                ➕ {t('addShelf')}
              </button>
            </div>

            {shelves.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">{t('noShelvesYet')}</p>
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
                <h2 className="text-2xl font-bold text-gray-900">{t('addNewShelf')}</h2>
                <button
                  onClick={() => setShowCreateShelfModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateShelf} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('shelfNameLabel')}</label>
                  <input
                    type="text"
                    value={shelfFormData.name}
                    onChange={(e) => setShelfFormData({ ...shelfFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={t('shelfNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('shortDescriptionLabel')}</label>
                  <input
                    type="text"
                    value={shelfFormData.short_description}
                    onChange={(e) => setShelfFormData({ ...shelfFormData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={t('briefDescriptionForCardPlaceholder')}
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('longDescriptionLabel')}</label>
                  <textarea
                    value={shelfFormData.long_description}
                    onChange={(e) => setShelfFormData({ ...shelfFormData, long_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={t('detailedDescriptionDetailViewPlaceholder')}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateShelfModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {isSubmitting ? t('adding') : t('addShelfButton')}
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
                          <span>{formatDateAsddmmyy(book.year)}</span>
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

        {/* Move Book Modal */}
        <MoveBookModal
          book={bookToMove}
          libraries={libraries}
          allBookshelves={allBookshelves}
          allShelves={allShelves}
          onClose={() => {
            setShowMoveBookModal(false)
            setBookToMove(null)
            setSelectedShelfForMove(null)
            setSelectedLibraryForBook('')
            setSelectedBookshelfForBook('')
          }}
          onMove={async (bookId: number, shelfId: number) => {
            const response = await fetch(`/api/books/${bookId}/move/`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shelf_id: shelfId,
                status: 'library'
              })
            })
            if (!response.ok) throw new Error(`API error: ${response.status}`)
            await loadAllBooks()
            // Reload all shelves
            const allShResponse = await fetch('/api/shelves/')
            if (!allShResponse.ok) throw new Error(`Failed to load shelves`)
            const allShData = await allShResponse.json()
            setAllShelves(allShData)
          }}
        />

        {/* Shelf Detail Popup */}
        {shelfDetailPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Fixed Header */}
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <img src="/shelf.png" alt="Shelf" className="w-6 h-6" /> #{shelfDetailPopup.order}{shelfDetailPopup.name ? `: ${shelfDetailPopup.name}` : ''}
                    </h2>
                    {shelfDetailPopup.short_description && (
                      <p className="text-sm text-gray-600 mt-2">{shelfDetailPopup.short_description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShelfDetailPopup(null)}
                    className="text-gray-500 hover:text-gray-700 text-3xl leading-none transition-colors flex-shrink-0"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="h-[500px] overflow-y-auto p-6">
                {(() => {
                  const shelfBooks = books.filter(b => b.shelf_id === shelfDetailPopup.id && b.status !== 'borrowed')
                  return shelfBooks.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No books on this shelf</p>
                  ) : (
                    <div>
                      {/* Controls Row */}
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600 font-medium">{shelfBooks.length} book{shelfBooks.length !== 1 ? 's' : ''}</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShelfColumnsView(1)}
                            className={`p-1.5 rounded transition-all ${
                              shelfColumnsView === 1
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                            title="1 column layout"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                              <path d="M3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                              <path d="M3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShelfColumnsView(2)}
                            className={`p-1.5 rounded transition-all ${
                              shelfColumnsView === 2
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                            title="2 column layout"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <rect x="2" y="3" width="7" height="6" />
                              <rect x="11" y="3" width="7" height="6" />
                              <rect x="2" y="11" width="7" height="6" />
                              <rect x="11" y="11" width="7" height="6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className={`${shelfColumnsView === 2 ? 'grid grid-cols-2 gap-4' : 'space-y-3'}`}>
                        {shelfBooks.map((book) => (
                          <div
                            key={book.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-amber-500"
                          >
                            <div className="p-3">
                              {/* Title and Actions Row */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="font-bold text-base text-gray-900 line-clamp-2 flex-1">{book.title}</h3>
                                
                                {/* Action Icons - Right Aligned, Horizontal */}
                                <div className="flex gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => setDetailPopup({ type: 'book', data: book })}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
                                      className="p-1.5 hover:bg-green-50 rounded transition-colors"
                                      title="Lend book"
                                    >
                                      <img src="/borrow.png" alt="Lend" className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to move "${book.title}" to storage?`)) {
                                        handleMoveBook(book.id, null)
                                      }
                                    }}
                                    className="p-1.5 hover:bg-orange-50 rounded transition-colors"
                                    title="Move to storage"
                                  >
                                    <img src="/box.png" alt="Storage" className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Metadata */}
                              <div className="space-y-1 mb-2">
                                {book.author && (
                                  <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <img src="/feather-pen.png" alt="Author" className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{book.author}</span>
                                  </p>
                                )}
                                {book.year && (
                                  <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <img src="/calendar.png" alt="Year" className="w-4 h-4 flex-shrink-0" />
                                    <span>{formatDateAsddmmyy(book.year)}</span>
                                  </p>
                                )}
                              </div>

                              {/* Description with Separator */}
                              {book.short_description && (
                                <div className="border-t border-gray-200 pt-2">
                                  <p className="text-xs text-gray-600 line-clamp-2">{book.short_description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Detail Popup Modal for Books within Shelf */}
              {detailPopup && detailPopup.type === 'book' && (
                <BookDetailModal book={detailPopup.data as Book} onClose={() => setDetailPopup(null)} />
              )}
            </div>
          </div>
        )}

        {/* Select Storage Books Modal */}
        {showSelectStorageBooksModal && selectedShelfForAddingBooks && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Fixed Header */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Select Books from Storage</h2>
                    {selectedShelfForAddingBooks && (
                      <p className="text-sm text-gray-600 mt-2">Adding books to: <span className="font-medium">{selectedShelfForAddingBooks.name}</span></p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowSelectStorageBooksModal(false)
                      setSelectedShelfForAddingBooks(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 text-3xl leading-none transition-colors flex-shrink-0 ml-4"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {storageBooks.filter((book: any) => book.status !== 'borrowed').length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No books available in storage</p>
                ) : (
                  <div className="space-y-3">
                    {storageBooks.filter((book: any) => book.status !== 'borrowed').map((book: any) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded border-l-4 border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-base text-gray-900 mb-2">{book.title}</p>
                          <div className="space-y-1 mb-2">
                            {book.author && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <img src="/feather-pen.png" alt="Author" className="w-4 h-4" />
                                <span>{book.author}</span>
                              </p>
                            )}
                            {book.year && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <img src="/calendar.png" alt="Date" className="w-4 h-4" />
                                <span>{formatDateAsddmmyy(book.year)}</span>
                              </p>
                            )}
                          </div>
                          {book.short_description && (
                            <div className="border-t border-gray-200 pt-2">
                              <p className="text-xs text-gray-600">{book.short_description}</p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Are you sure you want to add "${book.title}" to this shelf?`)) return
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
                              // Reload all books and storage books to refresh the list
                              await loadAllBooks()
                              await loadStorageBooks()
                            } catch (err) {
                              setError(`Failed to move book: ${err instanceof Error ? err.message : 'Unknown error'}`)
                            }
                          }}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition flex-shrink-0 ml-3"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Borrow Book Modal - For Bookshelf Detail View */}
        {showBorrowModal && (
          <BorrowBookModal
            book={bookToBorrow}
            users={users}
            useConfirmationFlow={true}
            onClose={() => {
              setShowBorrowModal(false)
              setBookToBorrow(null)
              setSelectedUserForBorrow('')
            }}
            onUserSelected={(book, user) => {
              setShowBorrowModal(false)
              setBookToBorrow(book)
              setSelectedUserForConfirmation(user)
              setShowBorrowConfirmation(true)
            }}
          />
        )}

        {/* Borrow Confirmation Modal - For Bookshelf Detail View */}
        {showBorrowConfirmation && (
          <BorrowConfirmationModal
            book={bookToBorrow}
            user={selectedUserForConfirmation}
            onClose={() => {
              setShowBorrowConfirmation(false)
              setBookToBorrow(null)
              setSelectedUserForConfirmation(null)
            }}
            onConfirm={async (bookId, userId, borrowTime, notes) => {
              try {
                const requestBody = {
                  borrow_time: borrowTime.toISOString(),
                  notes: notes
                }
                const response = await fetch(`/api/books/${bookId}/borrow/${userId}/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(requestBody)
                })
                if (!response.ok) throw new Error(`API error: ${response.status}`)
                await loadAllBooks()
                await loadStorageBooks()
                if (selectedBookshelf) {
                  await loadShelves(selectedBookshelf.id)
                }
                setShowBorrowConfirmation(false)
                setBookToBorrow(null)
                setSelectedUserForConfirmation(null)
              } catch (err) {
                throw err
              }
            }}
          />
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
                  title={showNavPane ? t('hideNavigation') : t('showNavigation')}
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
                  title={t('goBackToDashboard')}
                >
                  🏠
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2"><img src="/library.png" alt="Library" className="w-8 h-8" /> {selectedLibrary.name}</h1>
              <LanguageSwitcher />
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
                <h2 className="text-2xl font-bold text-gray-800">{t('bookshelves_count').replace('{count}', bookshelves.length.toString())}</h2>
            <button
              onClick={() => {
                setEditingBookshelf(null)
                setBookshelfFormData({ name: '', description: '' })
                setShowCreateBookshelfModal(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
            >
              ➕ {t('addBookshelf')}
            </button>
          </div>

          {bookshelves.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">{t('noBookshelvesYet')}</p>
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
                  {editingBookshelf ? t('editBookshelf') : t('createNewBookshelf')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookshelfNameLabel')} *</label>
                  <input
                    type="text"
                    required
                    value={bookshelfFormData.name}
                    onChange={(e) => setBookshelfFormData({ ...bookshelfFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('fictionSectionPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('shortDescriptionLabel')}</label>
                  <input
                    type="text"
                    value={bookshelfFormData.short_description}
                    onChange={(e) => setBookshelfFormData({ ...bookshelfFormData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('briefDescriptionOnCardPlaceholder')}
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('longDescriptionLabel')}</label>
                  <textarea
                    value={bookshelfFormData.long_description}
                    onChange={(e) => setBookshelfFormData({ ...bookshelfFormData, long_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('detailedDescriptionPopupPlaceholder')}
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
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {isSubmitting ? t('saving') : editingBookshelf ? t('updateLibrary') : t('createLibrary')}
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
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><img src="/library.png" alt="Library" className="w-8 h-8" /> {t('libraryMonitor')}</h1>
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <DashboardClickable
            books={books}
            shelves={shelves}
            selectedBookshelf={selectedBookshelf}
            libraries={libraries}
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
      </div>
    )
  }

  // Borrowed View - Extract to BorrowedView component
  if (activeMainTab === 'borrowed') {
    const handleRefreshData = async () => {
      await loadAllBooks()
      await loadStorageBooks()
      await fetchBorrowings()
    }
    
    mainContent = (
      <BorrowedView
        books={books}
        users={users}
        detailPopup={detailPopup}
        onSetDetailPopup={setDetailPopup}
        onReturnBook={handleReturnBook}
        onNavigateBack={() => {
          setActiveMainTab('dashboard')
          updateUrl('dashboard')
        }}
        onRefreshData={handleRefreshData}
        onShowReturnConfirmation={(borrowing) => {
          setBorrowingToReturn(borrowing)
          setShowReturnConfirmation(true)
          setOnReturnCompleteCallback(() => async () => {
            await handleRefreshData()
          })
        }}
      />
    )
  }

  if (activeMainTab === 'libraries') {
    mainContent = (
      <LibrariesView
        libraries={libraries}
        allBookshelves={allBookshelves}
        allShelves={allShelves}
        books={books}
        selectedLibrary={selectedLibrary}
        selectedBookshelf={selectedBookshelf}
        expandedBookshelves={expandedBookshelves}
        error={error}
        isSubmitting={isSubmitting}
        sensors={sensors}
        libraryFormData={libraryFormData}
        editingLibrary={editingLibrary}
        detailPopup={detailPopup}
        shelfDetailPopup={shelfDetailPopup}
        showCreateLibraryModal={showCreateLibraryModal}
        showNavPane={showNavPane}
        onBackClick={() => {
          setActiveMainTab('dashboard')
          updateUrl('dashboard')
        }}
        onToggleNavPane={() => setShowNavPane(!showNavPane)}
        onCreateLibraryClick={() => {
          setLibraryFormData({ name: '', description: '', address: '', phone: '', email: '' })
          setShowCreateLibraryModal(true)
        }}
        onSelectLibrary={handleSelectLibrary}
        onSelectBookshelf={handleSelectBookshelf}
        onToggleBookshelfExpansion={(id: number) => {
          const newExpanded = new Set(expandedBookshelves)
          if (newExpanded.has(id)) {
            newExpanded.delete(id)
          } else {
            newExpanded.add(id)
          }
          setExpandedBookshelves(newExpanded)
        }}
        onEditLibrary={openEditLibraryModal}
        onDeleteLibrary={handleDeleteLibrary}
        onSetDetailPopup={setDetailPopup}
        onSetShelfDetailPopup={setShelfDetailPopup}
        onLibraryDragEnd={handleLibraryDragEnd}
      />
    )
  }

  if (activeMainTab === 'manage-books') {
    mainContent = (
      <ManageBooksView
        books={books}
        borrowings={borrowings}
        users={users}
        libraries={libraries}
        allBookshelves={allBookshelves}
        allShelves={allShelves}
        error={error}
        isSubmitting={isSubmitting}
        bookToBorrow={bookToBorrow}
        bookToMove={bookToMove}
        onBackClick={() => {
          setActiveMainTab('dashboard')
          updateUrl('dashboard')
        }}
        onAddBookClick={() => {
          setBookFormData({ title: '', author: '', year: '', short_description: '', long_description: '' })
          setPlacementType('storage')
          setShowCreateBookModal(true)
        }}
        onEditBook={(book) => {
          setEditingBook(book)
          setBookFormData({
            title: book.title,
            author: book.author || '',
            year: book.year ? String(book.year) : '',
            short_description: book.short_description || '',
            long_description: book.long_description || ''
          })
          setShowCreateBookModal(true)
        }}
        onDeleteBook={handleDeleteBook}
        onSetBookToBorrow={setBookToBorrow}
        onSetBookToMove={setBookToMove}
        onSetShowBorrowModal={setShowBorrowModal}
        onSetShowMoveBookModal={setShowMoveBookModal}
        onMoveToStorage={handleMoveToStorage}
        onReturnBook={handleReturnBook}
        onShowReturnConfirmation={(borrowing) => {
          setBorrowingToReturn(borrowing)
          setShowReturnConfirmation(true)
        }}
        onNavigateToLibrariesView={async (libraryId: number) => {
          const library = libraries.find((lib: Library) => lib.id === libraryId)
          if (library) {
            await handleSelectLibrary(library)
          }
          setActiveMainTab('libraries')
          updateUrl('libraries', libraryId)
        }}
        onNavigateToBookshelfView={async (libraryId: number, bookshelfId: number) => {
          const library = libraries.find((lib: Library) => lib.id === libraryId)
          const bookshelf = allBookshelves.find((bs: Bookshelf) => bs.id === bookshelfId)
          if (library) {
            setSelectedLibrary(library)
            setExpandedBookshelves((prev: Set<number>) => {
              const newExpanded = new Set(prev)
              newExpanded.add(library.id)
              return newExpanded
            })
          }
          if (bookshelf) {
            await handleSelectBookshelf(bookshelf)
          }
          setActiveMainTab('libraries')
          updateUrl('libraries', libraryId, bookshelfId)
        }}
        onNavigateToShelfView={async (libraryId: number, bookshelfId: number, shelfId: number) => {
          const library = libraries.find((lib: Library) => lib.id === libraryId)
          const bookshelf = allBookshelves.find((bs: Bookshelf) => bs.id === bookshelfId)
          const shelf = allShelves.find((s: Shelf) => s.id === shelfId)
          
          if (library) {
            setSelectedLibrary(library)
            setExpandedBookshelves((prev: Set<number>) => {
              const newExpanded = new Set(prev)
              newExpanded.add(library.id)
              if (bookshelf) {
                newExpanded.add(bookshelf.id)
              }
              return newExpanded
            })
          }
          if (bookshelf) {
            // Set the bookshelf and load its shelves
            setSelectedBookshelf(bookshelf)
            await loadShelves(bookshelf.id)
            // After shelves are loaded, open the detail popup
            if (shelf) {
              setShelfDetailPopup(shelf)
            }
          }
          setActiveMainTab('libraries')
          updateUrl('libraries', libraryId, bookshelfId)
        }}
        onRetry={() => {
          setError(null)
          loadAllBooks()
        }}
      />
    )
  }

  if (activeMainTab === 'manage-users') {
    mainContent = (
      <ManageUsersView
        users={users}
        books={books}
        error={error}
        onBackClick={() => {
          setActiveMainTab('dashboard')
          updateUrl('dashboard')
        }}
        onAddUserClick={() => {
          setUserFormData({
            full_name: '',
            gender: '',
            department: '',
            phone: '',
            dob: '',
            short_description: '',
            long_description: ''
          })
          setEditingUser(null)
          setShowCreateUserModal(true)
        }}
        onEditUser={(user) => {
          setEditingUser(user)
          setUserFormData({
            full_name: user.full_name,
            gender: user.gender,
            department: user.department || '',
            phone: user.phone || '',
            dob: user.dob || '',
            short_description: user.short_description || '',
            long_description: user.long_description || ''
          })
          setShowCreateUserModal(true)
        }}
        onDeleteUser={handleDeleteUser}
        onReturnBook={handleReturnBook}
        onRetry={() => {
          setError(null)
          loadUsers()
        }}
      />
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

      {/* Global Library Modal */}
      {showCreateLibraryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={() => { setShowCreateLibraryModal(false); setEditingLibrary(null) }}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingLibrary ? t('editLibrary') : t('addNewLibrary')}</h2>
              <button onClick={() => { setShowCreateLibraryModal(false); setEditingLibrary(null) }} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            <form onSubmit={editingLibrary ? handleUpdateLibrary : handleCreateLibrary} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('libraryNameLabel')} *</label>
                <input
                  type="text"
                  required
                  value={libraryFormData.name}
                  onChange={(e) => setLibraryFormData({ ...libraryFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('libraryNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shortDescriptionLabel')}</label>
                <input
                  type="text"
                  value={libraryFormData.short_description}
                  onChange={(e) => setLibraryFormData({ ...libraryFormData, short_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('briefDescriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('longDescriptionLabel')}</label>
                <textarea
                  value={libraryFormData.long_description}
                  onChange={(e) => setLibraryFormData({ ...libraryFormData, long_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('detailedDescriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addressLabel')}</label>
                <input
                  type="text"
                  value={libraryFormData.address}
                  onChange={(e) => setLibraryFormData({ ...libraryFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('libraryAddressPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneLabel')}</label>
                <input
                  type="tel"
                  value={libraryFormData.phone}
                  onChange={(e) => setLibraryFormData({ ...libraryFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('phoneNumberPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailLabel')}</label>
                <input
                  type="email"
                  value={libraryFormData.email}
                  onChange={(e) => setLibraryFormData({ ...libraryFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('emailAddressPlaceholder')}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateLibraryModal(false)
                    setEditingLibrary(null)
                    setLibraryFormData({ name: '', description: '', address: '', phone: '', email: '', short_description: '', long_description: '' })
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {isSubmitting ? t('saving') : (editingLibrary ? t('updateLibrary') : t('createLibrary'))}
                </button>
              </div>
            </form>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  required
                  value={userFormData.gender}
                  onChange={(e) => setUserFormData({ ...userFormData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Gender --</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={userFormData.department}
                  onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g. Engineering, Marketing"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={userFormData.dob}
                  onChange={(e) => setUserFormData({ ...userFormData, dob: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    setUserFormData({ full_name: '', gender: '', department: '', phone: '', dob: '', short_description: '', long_description: '' })
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

      {/* Global Book Modal */}
      {showCreateBookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={() => setShowCreateBookModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold">{editingBook ? t('editBookTitle') : t('addNewBookTitle')}</h2>
              <button onClick={() => { setShowCreateBookModal(false); setEditingBook(null) }} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            
            <form onSubmit={editingBook ? handleUpdateBook : handleCreateBook} className="space-y-4 overflow-y-auto flex-1 p-6">
              {/* Book Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookTitleLabel')} *</label>
                <input
                  type="text"
                  required
                  value={bookFormData.title}
                  onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('bookTitlePlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('author')}</label>
                <input
                  type="text"
                  value={bookFormData.author}
                  onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('authorPlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('publicationDateLabel')}</label>
                <input
                  type="date"
                  value={bookFormData.year || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setBookFormData({ ...bookFormData, year: e.target.value })
                    } else {
                      setBookFormData({ ...bookFormData, year: '' })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shortDescriptionLabel')}</label>
                <input
                  type="text"
                  value={bookFormData.short_description}
                  onChange={(e) => setBookFormData({ ...bookFormData, short_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('briefDescriptionPlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('longDescriptionLabel')}</label>
                <textarea
                  value={bookFormData.long_description}
                  onChange={(e) => setBookFormData({ ...bookFormData, long_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('detailedDescriptionPlaceholder')}
                  rows={3}
                />
              </div>
              
              {/* Placement Options - only show when creating, not editing */}
              {!editingBook && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('wherePlaceBook')}</label>
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
                      <span className="text-sm text-gray-700">{t('placementStorage')}</span>
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
                      <span className="text-sm text-gray-700">{t('placementShelf')}</span>
                    </label>
                  </div>
                </div>
              )}
              
              {!editingBook && placementType === 'shelf' && (
                <div className="space-y-3 bg-gray-50 p-3 rounded">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('libraries')} *</label>
                    <select
                      value={selectedLibraryForBook}
                      onChange={(e) => {
                        setSelectedLibraryForBook(e.target.value)
                        setSelectedBookshelfForBook('')
                        setSelectedShelfIdForBook('')
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('selectLibraryOption')}</option>
                      {libraries.map((lib) => (
                        <option key={lib.id} value={lib.id}>{lib.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedLibraryForBook && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookshelfName')} *</label>
                      <select
                        value={selectedBookshelfForBook}
                        onChange={(e) => {
                          setSelectedBookshelfForBook(e.target.value)
                          setSelectedShelfIdForBook('')
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{t('selectBookshelfOption')}</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('shelfName')} *</label>
                      <select
                        value={selectedShelfIdForBook}
                        onChange={(e) => setSelectedShelfIdForBook(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{t('selectShelfOption')}</option>
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
                    setEditingBook(null)
                    setBookFormData({ title: '', author: '', year: '', short_description: '', long_description: '' })
                    setPlacementType('storage')
                    setSelectedLibraryForBook('')
                    setSelectedBookshelfForBook('')
                    setSelectedShelfIdForBook('')
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {isSubmitting ? t('saving') : (editingBook ? t('updateBook') : t('createBook'))}
                </button>
              </div>
            </form>
            
            <div className="border-t border-gray-200 p-6 flex-shrink-0 bg-gray-50">
              {error && (
                <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Borrow Book Modal */}
      {showBorrowModal && (
        <BorrowBookModal
          book={bookToBorrow}
          users={users}
          useConfirmationFlow={true}
          onClose={() => {
            setShowBorrowModal(false)
            setBookToBorrow(null)
            setSelectedUserForBorrow('')
          }}
          onUserSelected={(book, user) => {
            setShowBorrowModal(false)
            setBookToBorrow(book)
            setSelectedUserForConfirmation(user)
            setShowBorrowConfirmation(true)
          }}
        />
      )}

      {/* Borrow Confirmation Modal */}
      {showBorrowConfirmation && (
        <BorrowConfirmationModal
          book={bookToBorrow}
          user={selectedUserForConfirmation}
          onClose={() => {
            setShowBorrowConfirmation(false)
            setBookToBorrow(null)
            setSelectedUserForConfirmation(null)
          }}
          onConfirm={async (bookId, userId, borrowTime, notes) => {
            try {
              console.log('DEBUG: BorrowTime Date object:', borrowTime)
              console.log('DEBUG: UTC ISO string:', borrowTime.toISOString())
              
              // Call the API to create borrowing record with UTC datetime
              const requestBody = {
                borrow_time: borrowTime.toISOString(),
                notes: notes
              }
              console.log('DEBUG: Request body:', requestBody)
              
              const response = await fetch(`/api/books/${bookId}/borrow/${userId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
              })
              console.log('DEBUG: API Response status:', response.status)
              if (!response.ok) throw new Error(`API error: ${response.status}`)
              await loadAllBooks()
              await loadStorageBooks()
              if (selectedBookshelf) {
                await loadShelves(selectedBookshelf.id)
              }
              setShowBorrowConfirmation(false)
              setBookToBorrow(null)
              setSelectedUserForConfirmation(null)
            } catch (err) {
              throw err
            }
          }}
        />
      )}

      {/* Return Confirmation Modal */}
      {showReturnConfirmation && borrowingToReturn && (
        <ReturnConfirmationModal
          borrowing={borrowingToReturn}
          book={borrowingToReturn ? books.find(b => b.id === borrowingToReturn.book_id) || null : null}
          user={borrowingToReturn ? users.find(u => u.id === borrowingToReturn.user_id) || null : null}
          onClose={() => {
            setShowReturnConfirmation(false)
            setBorrowingToReturn(null)
          }}
          onConfirm={async (borrowingId, returnDate, returnNotes) => {
            try {
              const requestBody = {
                return_date: returnDate.toISOString(),
                return_notes: returnNotes
              }
              
              const response = await fetch(`/api/borrowings/${borrowingId}/return/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
              })
              if (!response.ok) throw new Error(`API error: ${response.status}`)
              
              await loadAllBooks()
              await loadStorageBooks()
              await fetchBorrowings()
              if (selectedBookshelf) {
                await loadShelves(selectedBookshelf.id)
              }
              
              // Call the return complete callback if set
              if (onReturnCompleteCallback) {
                await onReturnCompleteCallback()
              }
              
              setShowReturnConfirmation(false)
              setBorrowingToReturn(null)
              setOnReturnCompleteCallback(null)
            } catch (err) {
              throw err
            }
          }}
        />
      )}

      {/* Global Move Book Modal */}
      {showMoveBookModal && (
        <MoveBookModal
          book={bookToMove}
          libraries={libraries}
          allBookshelves={allBookshelves}
          allShelves={allShelves}
          onClose={() => {
            setShowMoveBookModal(false)
            setBookToMove(null)
          }}
          onMove={handleMoveBook}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}