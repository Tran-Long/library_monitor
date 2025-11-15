import { useState, useCallback } from 'react'
import type { Borrowing } from '@/types'
import { borrowingService } from '@/services/api'

export const useBorrowings = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBorrowings = useCallback(async (filters?: { userId?: number; isReturned?: boolean }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await borrowingService.getAll(filters?.userId, filters?.isReturned)
      setBorrowings(response.data)
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch borrowings'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getCurrentBorrowings = useCallback(async () => {
    return fetchBorrowings({ isReturned: false })
  }, [fetchBorrowings])

  const getReturnedBorrowings = useCallback(async () => {
    return fetchBorrowings({ isReturned: true })
  }, [fetchBorrowings])

  const returnBorrowing = useCallback(async (borrowingId: number, returnDate?: Date, returnNotes?: string) => {
    try {
      await borrowingService.returnBook(borrowingId, returnDate, returnNotes)
      // Refresh the list
      await fetchBorrowings()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to return book'
      setError(message)
      return false
    }
  }, [fetchBorrowings])

  return {
    borrowings,
    loading,
    error,
    fetchBorrowings,
    getCurrentBorrowings,
    getReturnedBorrowings,
    returnBorrowing,
  }
}

