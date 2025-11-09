import { useState } from 'react'
import type { User } from '@/types'

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users/')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users'
      setError(errorMessage)
    }
  }

  const handleCreateUser = async (formData: any) => {
    try {
      const response = await fetch('/api/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API error: ${response.status}`)
      }

      await loadUsers()
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMessage)
      throw err
    }
  }

  const handleUpdateUser = async (userId: number, formData: any) => {
    try {
      const response = await fetch(`/api/users/${userId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API error: ${response.status}`)
      }

      await loadUsers()
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMessage)
      throw err
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      await loadUsers()
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
      setError(errorMessage)
      throw err
    }
  }

  return {
    users,
    setUsers,
    error,
    setError,
    loadUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
  }
}
