import { useState } from 'react'
import type { Library, Bookshelf, Shelf } from '@/types'

export const useLibraries = () => {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [allBookshelves, setAllBookshelves] = useState<Bookshelf[]>([])
  const [allShelves, setAllShelves] = useState<Shelf[]>([])
  const [error, setError] = useState<string | null>(null)

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load libraries'
      setError(errorMessage)
    }
  }

  return {
    libraries,
    setLibraries,
    allBookshelves,
    setAllBookshelves,
    allShelves,
    setAllShelves,
    error,
    setError,
    loadLibraries,
  }
}
