import React from 'react'
import type { User } from '@/types'

interface UserDetailModalProps {
  user: User | null
  onClose: () => void
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Anchored Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white flex justify-between items-center flex-shrink-0 z-10">
          <h2 className="text-2xl font-bold">👤 User Details</h2>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-1 rounded transition-colors text-2xl">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Full Name */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Full Name</h3>
            <p className="text-gray-600 mt-2 text-base">{user.full_name || '-'}</p>
          </div>

          {/* Gender */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Gender</h3>
            <p className="text-gray-600 mt-2 text-base">{user.gender || '-'}</p>
          </div>

          {/* Department */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Department</h3>
            <p className="text-gray-600 mt-2 text-base">{user.department || '-'}</p>
          </div>

          {/* Phone */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Phone</h3>
            <p className="text-gray-600 mt-2 text-base">{user.phone || '-'}</p>
          </div>

          {/* Date of Birth */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Date of Birth</h3>
            <p className="text-gray-600 mt-2 text-base">{user.dob ? new Date(user.dob).toLocaleDateString() : '-'}</p>
          </div>

          {/* Short Description */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Short Description</h3>
            <p className="text-gray-600 mt-2 text-base">{user.short_description || '-'}</p>
          </div>

          {/* Long Description */}
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">Long Description</h3>
            <p className="text-gray-600 mt-2 text-base whitespace-pre-wrap">{user.long_description || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal
