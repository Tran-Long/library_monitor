import React from 'react'
import type { User } from '@/types'

interface ManageUsersViewProps {
  users: User[]
  error: string | null
  onBackClick: () => void
  onAddUserClick: () => void
  onEditUser: (user: User) => void
  onDeleteUser: (userId: number) => void
}

export const ManageUsersView: React.FC<ManageUsersViewProps> = ({
  users,
  error,
  onBackClick,
  onAddUserClick,
  onEditUser,
  onDeleteUser,
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={onBackClick} className="text-blue-600 hover:text-blue-700 font-medium" title="Go back to dashboard">
              🏠
            </button>
            <h1 className="text-3xl font-bold text-gray-900">👥 Manage Users</h1>
            <button
              onClick={onAddUserClick}
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
              onClick={onAddUserClick}
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
                    onClick={() => onEditUser(user)}
                    className="flex-1 text-sm px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteUser(user.id)}
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
