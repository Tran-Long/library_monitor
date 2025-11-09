import { useState } from 'react'
import type { Book } from '@/types'

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadAllBooks = async () => {
    try {
      const response = await fetch('/api/books/')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setBooks(data)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load books'
      setError(errorMessage)
    }
  }

  const handleCreateBook = async (formData: any, placementType: string, selectedShelfId: string) => {
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        year: formData.year,
        short_description: formData.short_description,
        long_description: formData.long_description,
        shelf_id: placementType === 'shelf' ? (selectedShelfId ? parseInt(selectedShelfId) : null) : null,
        status: placementType === 'storage' ? 'storage' : 'available',
      }

      const response = await fetch('/api/books/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API error: ${response.status}`)
      }

      await loadAllBooks()
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create book'
      setError(errorMessage)
      throw err
    }
  }

  const handleDeleteBook = async (bookId: number) => {
    try {
      const response = await fetch(`/api/books/${bookId}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      await loadAllBooks()
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete book'
      setError(errorMessage)
      throw err
    }
  }

  return {
    books,
    setBooks,
    error,
    setError,
    loadAllBooks,
    handleCreateBook,
    handleDeleteBook,
  }
}
